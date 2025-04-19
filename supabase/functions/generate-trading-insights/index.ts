
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

    if (!llamaApiKey) {
      console.error('Missing Llama API key');
      return new Response(
        JSON.stringify({ 
          insights: [{
            id: 'error',
            title: 'API Configuration Error',
            content: 'API key not properly configured. Please contact system administrator.',
            category: 'error',
            importance: 'high'
          }]
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
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

          Generate 3-5 specific trading tips in English, focusing on:
          - Performance improvement
          - Risk management
          - Trading psychology
          - Strategy optimization

          Return the response as a JSON object with an "insights" array, where each item has:
          - id: unique string
          - title: short tip title
          - content: detailed explanation
          - category: one of ["performance", "risk", "psychology", "strategy"]
          - importance: one of ["high", "medium", "low"]
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

          Generate 4-6 specific trading insights in English, focusing on:
          - Performance patterns
          - Risk management opportunities
          - Psychological aspects
          - Strategy improvements
          - Trading patterns
          
          ${playbooks.length > 0 ? `Consider these existing trading playbooks: ${JSON.stringify(playbooks.map(p => p.title))}` : ''}

          Return the response as a JSON object with an "insights" array, where each item has:
          - id: unique string
          - title: short insight title
          - content: detailed explanation (50-100 words)
          - category: one of ["performance", "psychology", "risk", "strategy", "pattern", "data"]
          - importance: one of ["high", "medium", "low"]
        `;
      }

      // Make the API call to Llama API
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
              content: 'You are a professional trading advisor. Analyze the trading data and provide actionable insights.'
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          response_format: responseFormat
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
        return new Response(JSON.stringify({ analysis: parsedContent.analysis || "Sorry, an error occurred while analyzing the data" }), {
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
          title: 'Improve Win Rate',
          content: 'Focus on increasing profitable trades while minimizing losses for better overall results.',
          category: 'performance',
          importance: 'high'
        },
        {
          id: 'fallback-2',
          title: 'Session Analysis',
          content: 'Focus on trading sessions that yield the best results and avoid sessions with recurring losses.',
          category: 'strategy',
          importance: 'medium'
        },
        {
          id: 'fallback-3',
          title: 'Risk Management',
          content: 'Ensure clear entry and exit points are defined before entering any trade to improve risk management.',
          category: 'risk',
          importance: 'high'
        },
        {
          id: 'fallback-4',
          title: 'Trading Psychology',
          content: 'Maintain psychological discipline and avoid emotional decision-making while trading.',
          category: 'psychology',
          importance: 'medium'
        }
      ];
      
      if (purpose === 'advice') {
        return new Response(JSON.stringify({ 
          analysis: "Sorry, an error occurred while analyzing the data. Please check your internet connection and try again."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ insights: fallbackInsights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-trading-insights function:', error);
    return new Response(
      JSON.stringify({ 
        insights: [{
          id: 'error',
          title: 'Sorry, an error occurred',
          content: 'An error occurred while processing your request. Please try again later.',
          category: 'error',
          importance: 'high'
        }]
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
