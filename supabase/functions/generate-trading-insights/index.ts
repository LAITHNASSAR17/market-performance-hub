
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
          Make sure to write in Arabic language.
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

          Generate 3-5 specific trading tips in Arabic, focusing on:
          - Performance improvement
          - Risk management
          - Trading psychology
          - Strategy optimization

          Return the response as a JSON object with an "insights" array, where each item has:
          - id: unique string
          - title: short tip title in Arabic
          - content: detailed explanation in Arabic
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

          ${trades.length >= 10 ? `
          Analyze the trading patterns and provide 4-6 detailed insights in Arabic focusing on:
          - Performance trends and patterns
          - Risk management effectiveness
          - Psychological aspects of trading
          - Strategy strengths and weaknesses
          - Areas for improvement
          - Potential optimization opportunities
          ` : `
          Provide 3-4 initial insights in Arabic about:
          - Current trading approach
          - Risk management
          - Areas to focus on
          - Next steps for improvement
          `}
          
          ${playbooks.length > 0 ? `Consider these existing trading playbooks: ${JSON.stringify(playbooks.map(p => p.title))}` : ''}

          Return the response as a JSON object with an "insights" array, where each item has:
          - id: unique string
          - title: short insight title in Arabic
          - content: detailed explanation (50-100 words) in Arabic
          - category: one of ["performance", "psychology", "risk", "strategy", "pattern", "data"]
          - importance: one of ["high", "medium", "low"]

          Make all responses in Arabic language and ensure they are specific and actionable.
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
              content: 'You are an expert trading advisor specializing in technical analysis and trading psychology. Provide detailed insights in Arabic language. Be specific and actionable in your recommendations.'
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
        return new Response(JSON.stringify({ analysis: parsedContent.analysis || "عذراً، حدث خطأ في تحليل البيانات" }), {
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
          title: 'تحسين نسبة الربح',
          content: 'ركز على زيادة الصفقات المربحة مع تقليل الخسائر للحصول على نتائج أفضل.',
          category: 'performance',
          importance: 'high'
        },
        {
          id: 'fallback-2',
          title: 'تحليل الجلسات',
          content: 'ركز على جلسات التداول التي تحقق أفضل النتائج وتجنب الجلسات ذات الخسائر المتكررة.',
          category: 'strategy',
          importance: 'medium'
        },
        {
          id: 'fallback-3',
          title: 'إدارة المخاطر',
          content: 'تأكد من تحديد نقاط الدخول والخروج بوضوح قبل الدخول في أي صفقة لتحسين إدارة المخاطر.',
          category: 'risk',
          importance: 'high'
        },
        {
          id: 'fallback-4',
          title: 'علم النفس التداول',
          content: 'حافظ على الانضباط النفسي وتجنب اتخاذ القرارات العاطفية أثناء التداول.',
          category: 'psychology',
          importance: 'medium'
        }
      ];
      
      if (purpose === 'advice') {
        return new Response(JSON.stringify({ 
          analysis: "عذراً، حدث خطأ أثناء تحليل البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
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
        error: 'حدث خطأ غير متوقع',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

