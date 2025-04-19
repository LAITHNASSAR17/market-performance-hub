import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const llamaApiKey = Deno.env.get('LLAMA_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trades, stats } = await req.json();

    // Log input data for debugging
    console.log('Received trading advice request');
    console.log('Trades count:', trades.length);
    console.log('API Key present:', !!llamaApiKey);

    if (!llamaApiKey) {
      console.error('CRITICAL: LLAMA_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          analysis: 'عذراً، لم يتم تكوين مفتاح API بشكل صحيح. يرجى الاتصال بمسؤول النظام.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      console.log('Calling Llama API for trading advice');
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llamaApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-maverick:free",
          messages: [
            {
              role: 'system',
              content: 'You are a professional trading advisor. Analyze the trading data and provide detailed advice in Arabic.'
            },
            {
              role: 'user',
              content: `
                Based on these trading statistics:
                - Number of trades: ${trades.length}
                - Win rate: ${stats.winRate}%
                - Average win: $${stats.avgWin}
                - Average loss: $${stats.avgLoss}
                - Profit factor: ${stats.profitFactor}
                - Largest win: $${stats.largestWin}
                - Largest loss: $${stats.largestLoss}

                Provide a detailed analysis and advice in Arabic, focusing on:
                - Overall performance assessment
                - Strengths and weaknesses
                - Areas for improvement
                - Specific recommendations
                - Risk management suggestions
                - Psychological aspects

                Keep the response focused and actionable.
              `
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      const data = await response.json();
      console.log('Llama API Response:', data);

      if (data.error) {
        console.error('Llama API Error:', data.error);
        throw new Error(data.error.message || 'Error calling Llama API');
      }

      return new Response(
        JSON.stringify({ analysis: data.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error generating advice:', error);
      throw error;
    }
  } catch (error) {
    console.error('Comprehensive error in generate-trading-advice:', error);
    return new Response(
      JSON.stringify({ 
        analysis: 'عذراً، حدث خطأ غير متوقع أثناء توليد التحليل.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
