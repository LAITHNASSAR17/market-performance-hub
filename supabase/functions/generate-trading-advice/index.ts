
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
        JSON.stringify({ analysis: 'أضف المزيد من الصفقات للحصول على تحليل مفصل لأدائك' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify API key exists
    if (!deepseekApiKey) {
      console.error('Missing Deepseek API key');
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
      console.log('Calling Deepseek API for trading advice');
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
          ]
        }),
      });

      const data = await response.json();
      console.log('Deepseek Response:', data);

      if (data.error) {
        console.error('Deepseek API Error:', data.error);
        throw new Error(data.error.message || 'Error calling Deepseek API');
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
    console.error('Error in generate-trading-advice function:', error);
    return new Response(
      JSON.stringify({ 
        analysis: 'عذراً، حدث خطأ أثناء توليد التحليل. يرجى المحاولة مرة أخرى لاحقاً.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
