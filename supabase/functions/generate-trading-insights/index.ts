
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

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

    if (!perplexityApiKey) {
      console.error('Missing Perplexity API key');
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
      console.log(`Calling Perplexity API for ${purpose}`);
      
      let userPrompt = '';
      
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
          
          Return the response in Arabic.
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

          Format each tip with:
          - A short title
          - Detailed explanation
          - Category (performance/risk/psychology/strategy)
          - Importance (high/medium/low)
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

          Generate 4-6 specific trading insights in Arabic, focusing on:
          - Performance patterns
          - Risk management opportunities
          - Psychological aspects
          - Strategy improvements
          - Trading patterns
          
          ${playbooks.length > 0 ? `Consider these existing trading playbooks: ${JSON.stringify(playbooks.map(p => p.title))}` : ''}

          Format each insight with:
          - A short title
          - Detailed explanation (50-100 words)
          - Category (performance/psychology/risk/strategy/pattern/data)
          - Importance (high/medium/low)
        `;
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a professional trading advisor that provides analysis in Arabic. Be precise and actionable in your recommendations.'
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        }),
      });

      const data = await response.json();
      console.log('Perplexity Response:', data);

      if (data.error) {
        console.error('Perplexity API Error:', data.error);
        throw new Error(data.error.message || 'Error calling Perplexity API');
      }

      // Process the response based on purpose
      if (purpose === 'advice') {
        return new Response(JSON.stringify({ 
          analysis: data.choices[0].message.content 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // For tips and insights, parse the response and format it
      const content = data.choices[0].message.content;
      const insights = content.split('\n\n').filter(Boolean).map((insight, index) => {
        const lines = insight.split('\n');
        return {
          id: `insight-${index + 1}`,
          title: lines[0].replace(/^[*-]\s*/, ''),
          content: lines.slice(1).join('\n').replace(/^[*-]\s*/, ''),
          category: lines.find(l => l.includes('Category'))?.split(':')[1]?.trim() || 'performance',
          importance: lines.find(l => l.includes('Importance'))?.split(':')[1]?.trim() || 'medium'
        };
      });

      return new Response(JSON.stringify({ insights }), {
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
