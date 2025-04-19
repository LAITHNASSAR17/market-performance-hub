
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, minimumTradesRequired, modelConfig, systemPrompt } from './config.ts';
import { generateUserPrompt } from './prompts.ts';
import { getFallbackInsights, getErrorFallbackInsights, getDefaultFallbackInsights } from './fallbacks.ts';
import type { GenerateInsightsRequest, LlamaAPIResponse } from './types.ts';

const llamaApiKey = Deno.env.get('LLAMA_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trades, stats, playbooks = [], timeRange = 'all', purpose = 'insights' } = await req.json() as GenerateInsightsRequest;

    console.log('Received request with purpose:', purpose);
    console.log('Trades count:', trades.length);
    console.log('API Key present:', !!llamaApiKey);

    if (!llamaApiKey) {
      console.error('CRITICAL: LLAMA_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: 'API key is missing. Please configure LLAMA_API_KEY in Supabase secrets.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const minimumTrades = minimumTradesRequired[purpose as keyof typeof minimumTradesRequired] || minimumTradesRequired.insights;

    if (!trades || trades.length < minimumTrades) {
      console.log(`Not enough trades for ${purpose}, returning default response`);
      
      if (purpose === 'advice') {
        return new Response(
          JSON.stringify({ analysis: `Add more trades to get detailed analysis. We need at least ${minimumTrades} trades.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ insights: getFallbackInsights(minimumTrades) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      console.log(`Calling Llama API for ${purpose}`);
      
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llamaApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...modelConfig,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: generateUserPrompt(purpose, stats, trades.length, timeRange, playbooks)
            }
          ]
        }),
      });

      const data = await response.json() as LlamaAPIResponse;
      console.log('Llama API Response:', data);

      if (data.error) {
        console.error('Llama API Error:', data.error);
        throw new Error(data.error.message || 'Error calling Llama API');
      }

      const parsedContent = JSON.parse(data.choices[0].message.content);
      
      return new Response(JSON.stringify({ 
        insights: parsedContent.insights || [],
        analysis: parsedContent.analysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error(`Error generating ${purpose}:`, error);
      
      if (purpose === 'advice') {
        return new Response(JSON.stringify({ 
          analysis: "Unable to generate analysis at this time. Please try again later."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ insights: getDefaultFallbackInsights() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Comprehensive error in generate-trading-insights:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
