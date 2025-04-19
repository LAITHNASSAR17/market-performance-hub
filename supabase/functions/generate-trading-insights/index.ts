
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const llamaApiKey = Deno.env.get('LLAMA_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trades, stats, playbooks = [], timeRange = 'all', purpose = 'insights' } = await req.json();

    // Log input data for debugging
    console.log('Received request with purpose:', purpose);
    console.log('Trades count:', trades.length);
    console.log('API Key present:', !!llamaApiKey);

    // Check API key explicitly
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

    const minimumTrades = purpose === 'insights' ? 5 : 3;

    if (!trades || trades.length < minimumTrades) {
      console.log(`Not enough trades for ${purpose}, returning default response`);
      
      if (purpose === 'advice') {
        return new Response(
          JSON.stringify({ analysis: `Add more trades to get detailed analysis. We need at least ${minimumTrades} trades.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          insights: [{
            id: 'data-1',
            title: 'More Data Needed',
            content: `Add more trades to get accurate analysis. We need at least ${minimumTrades} trades.`,
            category: 'data',
            importance: 'high'
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      console.log(`Calling Llama API for ${purpose}`);
      
      let userPrompt = '';
      let responseFormat = { type: "json_object" };
      
      if (purpose === 'advice') {
        userPrompt = `
          Based on these trading statistics:
          - Number of trades: ${trades.length}
          - Win rate: ${stats.winRate}%
          - Average win: $${stats.avgWin}
          - Average loss: $${stats.avgLoss}
          - Profit factor: ${stats.profitFactor}
          - Largest win: $${stats.largestWin}
          - Largest loss: $${stats.largestLoss}

          Generate a comprehensive trading analysis (300-400 words) that provides:
          - An assessment of overall trading performance
          - Specific strengths and weaknesses
          - Clear, actionable recommendations for improvement
          
          Return the response as a JSON object with an "analysis" field containing the text.
          Make it professional and insights-focused, aimed at helping traders improve their performance.
        `;
      } else if (purpose === 'tips') {
        userPrompt = `
          Based on these trading statistics:
          - Number of trades: ${trades.length}
          - Win rate: ${stats.winRate}%
          - Average win: $${stats.avgWin}
          - Average loss: $${stats.avgLoss}
          - Profit factor: ${stats.profitFactor}
          - Largest win: $${stats.largestWin}
          - Largest loss: $${stats.largestLoss}

          Generate 3-5 specific trading tips focusing on:
          - Performance improvement opportunities
          - Risk management strategies
          - Trading psychology insights
          - Strategy optimization suggestions

          Return the response as a JSON object with an "insights" array, where each item has:
          - id: unique string
          - title: short, actionable tip title
          - content: detailed explanation with specific steps
          - category: one of ["performance", "risk", "psychology", "strategy"]
          - importance: one of ["high", "medium", "low"]

          Make tips specific and actionable, focused on practical improvements.
        `;
      } else {
        userPrompt = `
          Based on these trading statistics from the ${timeRange} timeframe:
          - Number of trades: ${trades.length}
          - Win rate: ${stats.winRate}%
          - Average win: $${stats.avgWin}
          - Average loss: $${stats.avgLoss}
          - Profit factor: ${stats.profitFactor}
          - Largest win: $${stats.largestWin}
          - Largest loss: $${stats.largestLoss}

          ${trades.length >= 10 ? `
          Analyze the trading patterns and provide 4-6 detailed insights focusing on:
          - Performance trends and specific patterns in the data
          - Risk management effectiveness and areas for improvement
          - Psychological aspects impacting trading decisions
          - Strategy strengths and potential optimization areas
          - Key metrics that need attention
          - Specific opportunities for performance enhancement
          ` : `
          Provide 3-4 initial insights about:
          - Current trading approach effectiveness
          - Risk management observations
          - Key areas requiring immediate focus
          - Specific next steps for improvement
          `}
          
          ${playbooks.length > 0 ? `Consider these existing trading playbooks: ${JSON.stringify(playbooks.map(p => p.title))}` : ''}

          Return the response as a JSON object with an "insights" array, where each item has:
          - id: unique string
          - title: clear, specific insight title
          - content: detailed explanation (50-100 words) with actionable recommendations
          - category: one of ["performance", "psychology", "risk", "strategy", "pattern", "data"]
          - importance: one of ["high", "medium", "low"]

          Make insights specific, data-driven, and focused on actionable improvements.
        `;
      }

      // Make the API call to Together.ai's API
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llamaApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-sonar-small-128k-online",
          messages: [
            {
              role: 'system',
              content: 'You are an expert trading advisor specializing in technical analysis, risk management, and trading psychology. Provide detailed, actionable insights based on trading data. Focus on specific, implementable recommendations.'
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.2,
          response_format: responseFormat,
          max_tokens: 2000
        }),
      });

      const data = await response.json();
      console.log('Llama API Response:', data);

      if (data.error) {
        console.error('Llama API Error:', data.error);
        throw new Error(data.error.message || 'Error calling Llama API');
      }

      const parsedContent = JSON.parse(data.choices[0].message.content);
      
      if (purpose === 'advice' && !parsedContent.insights) {
        return new Response(JSON.stringify({ analysis: parsedContent.analysis || "Unable to generate analysis at this time" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        insights: parsedContent.insights || [],
        analysis: parsedContent.analysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error(`Error generating ${purpose}:`, error);
      
      const fallbackInsights = [
        {
          id: 'fallback-1',
          title: 'Focus on Profit Optimization',
          content: 'Review your trading strategy to identify patterns in profitable trades and replicate successful conditions.',
          category: 'performance',
          importance: 'high'
        },
        {
          id: 'fallback-2',
          title: 'Session Analysis',
          content: 'Analyze your most successful trading sessions and avoid times with recurring losses.',
          category: 'strategy',
          importance: 'medium'
        },
        {
          id: 'fallback-3',
          title: 'Risk Management Review',
          content: 'Ensure clear entry and exit points are defined before entering trades to improve risk management.',
          category: 'risk',
          importance: 'high'
        },
        {
          id: 'fallback-4',
          title: 'Psychological Discipline',
          content: 'Maintain consistent trading psychology and avoid emotional decision-making during market volatility.',
          category: 'psychology',
          importance: 'medium'
        }
      ];
      
      if (purpose === 'advice') {
        return new Response(JSON.stringify({ 
          analysis: "Unable to generate analysis at this time. Please try again later."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ insights: fallbackInsights }), {
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
