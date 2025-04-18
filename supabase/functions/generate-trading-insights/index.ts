
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trades, stats, playbooks = [], timeRange = 'all', purpose = 'insights' } = await req.json();

    // Use different minimum trade thresholds depending on purpose
    const minimumTrades = purpose === 'insights' ? 5 : 3;

    if (!trades || trades.length < minimumTrades) {
      console.log(`Not enough trades for ${purpose}, returning default response`);
      
      // Return appropriate fallback response based on purpose
      if (purpose === 'advice') {
        return new Response(
          JSON.stringify({ analysis: `أضف المزيد من الصفقات للحصول على تحليل مفصل لأدائك. نحتاج على الأقل ${minimumTrades} صفقات.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          insights: [{
            id: 'data-1',
            title: 'نحتاج المزيد من البيانات',
            content: `أضف المزيد من الصفقات للحصول على تحليل أكثر دقة. نحتاج على الأقل ${minimumTrades} صفقات.`,
            category: 'data',
            importance: 'high'
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify API key exists
    if (!deepseekApiKey) {
      console.error('Missing Deepseek API key');
      return new Response(
        JSON.stringify({ 
          insights: [{
            id: 'error',
            title: 'خطأ في تكوين API',
            content: 'لم يتم تكوين مفتاح API بشكل صحيح. يرجى الاتصال بمسؤول النظام.',
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
      console.log(`Calling Deepseek API for ${purpose}`);
      
      // Construct different prompts based on purpose
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

          Generate a comprehensive trading analysis in Arabic (300-400 words) that provides:
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
        // Default: insights
        userPrompt = `
          Based on these trading statistics from the ${timeRange} timeframe:
          - Number of trades: ${trades.length}
          - Win rate: ${stats.winRate}%
          - Average win: $${stats.avgWin}
          - Average loss: $${stats.avgLoss}
          - Profit factor: ${stats.profitFactor}
          - Largest win: $${stats.largestWin}
          - Largest loss: $${stats.largestLoss}

          Generate 4-6 specific trading insights in Arabic, focusing on:
          - Performance patterns
          - Risk management opportunities
          - Psychological aspects
          - Strategy improvements
          - Trading patterns
          
          ${playbooks.length > 0 ? `Consider these existing trading playbooks: ${JSON.stringify(playbooks.map(p => p.title))}` : ''}

          Return the response as a JSON object with an "insights" array, where each item has:
          - id: unique string
          - title: short insight title in Arabic
          - content: detailed explanation in Arabic (50-100 words)
          - category: one of ["performance", "psychology", "risk", "strategy", "pattern", "data"]
          - importance: one of ["high", "medium", "low"]
        `;
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: 'system',
              content: 'You are a professional trading advisor. Analyze the trading data and provide actionable insights in Arabic.'
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
      console.log('Deepseek Response:', data);

      if (data.error) {
        console.error('Deepseek API Error:', data.error);
        throw new Error(data.error.message || 'Error calling Deepseek API');
      }

      // Parse the JSON response from Deepseek
      const parsedContent = JSON.parse(data.choices[0].message.content);
      
      // If this was an advice request and the response doesn't have insights
      if (purpose === 'advice' && !parsedContent.insights) {
        return new Response(JSON.stringify({ analysis: parsedContent.analysis || "عذراً، حدث خطأ في تحليل البيانات" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // For tips and insights requests
      return new Response(JSON.stringify({ 
        insights: parsedContent.insights || [],
        analysis: parsedContent.analysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error(`Error generating ${purpose}:`, error);
      
      // Return appropriate fallback response
      const fallbackInsights = [
        {
          id: 'fallback-1',
          title: 'تحسين نسبة الربح',
          content: 'حاول زيادة حجم الصفقات الرابحة وتقليل حجم الصفقات الخاسرة للحصول على نتائج أفضل.',
          category: 'performance',
          importance: 'high'
        },
        {
          id: 'fallback-2',
          title: 'تحليل جلسات التداول',
          content: 'ركز على الجلسات التي تحقق فيها أفضل النتائج وتجنب الجلسات التي تسبب خسائر متكررة.',
          category: 'strategy',
          importance: 'medium'
        },
        {
          id: 'fallback-3',
          title: 'إدارة المخاطر',
          content: 'تأكد من تحديد نقاط الدخول والخروج بشكل واضح قبل الدخول في أي صفقة لتحسين إدارة المخاطر.',
          category: 'risk',
          importance: 'high'
        },
        {
          id: 'fallback-4',
          title: 'الانضباط النفسي',
          content: 'حافظ على الانضباط النفسي وتجنب اتخاذ قرارات عاطفية أثناء التداول.',
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
    console.error('Error in generate-trading-insights function:', error);
    return new Response(
      JSON.stringify({ 
        insights: [{
          id: 'error',
          title: 'عذراً، حدث خطأ',
          content: 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.',
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
