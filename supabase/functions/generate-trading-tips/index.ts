
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
    const { trades, stats } = await req.json();

    if (!trades || trades.length < 3) {
      return new Response(
        JSON.stringify([{
          id: '1',
          title: 'أضف المزيد من الصفقات',
          content: 'نحتاج المزيد من الصفقات لتقديم تحليل دقيق لأدائك',
          category: 'performance',
          priority: 'medium'
        }]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: 'You are a professional trading advisor. Analyze the trading data and provide actionable tips in Arabic.',
          messages: [
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

                Generate 3-5 specific trading tips in Arabic, focusing on:
                - Performance improvement
                - Risk management
                - Trading psychology
                - Strategy optimization

                Return the response as a JSON array of tips, each with:
                - id: unique string
                - title: short tip title in Arabic
                - content: detailed explanation in Arabic
                - category: one of ["performance", "risk", "psychology", "strategy"]
                - priority: one of ["high", "medium", "low"]
              `
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      console.log('Deepseek Response:', data);

      if (data.error) {
        console.error('Deepseek API Error:', data.error);
        throw new Error(data.error.message);
      }

      const tips = JSON.parse(data.choices[0].message.content).tips;
      return new Response(JSON.stringify(tips), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error generating tips:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in generate-trading-tips function:', error);
    return new Response(
      JSON.stringify([{
        id: 'error',
        title: 'عذراً، حدث خطأ',
        content: 'حدث خطأ أثناء توليد النصائح. يرجى المحاولة مرة أخرى لاحقاً.',
        category: 'error',
        priority: 'high'
      }]),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
