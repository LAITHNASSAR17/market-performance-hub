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
    console.log('Received trading tips request');
    console.log('Trades count:', trades.length);
    console.log('API Key present:', !!llamaApiKey);

    if (!llamaApiKey) {
      console.error('CRITICAL: LLAMA_API_KEY is not set');
      return new Response(
        JSON.stringify([{
          id: 'error',
          title: 'خطأ في تكوين API',
          content: 'لم يتم تكوين مفتاح API بشكل صحيح. يرجى الاتصال بمسؤول النظام.',
          category: 'error',
          priority: 'high'
        }]),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      console.log('Calling Llama API for trading tips');
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
              content: 'You are a professional trading advisor. Analyze the trading data and provide actionable tips in Arabic.'
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
          response_format: { type: "json_object" },
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

      const tips = JSON.parse(data.choices[0].message.content).tips;
      return new Response(JSON.stringify(tips), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error generating tips:', error);
      throw error;
    }
  } catch (error) {
    console.error('Comprehensive error in generate-trading-tips:', error);
    return new Response(
      JSON.stringify([{
        id: 'error',
        title: 'عذراً، حدث خطأ',
        content: 'حدث خطأ غير متوقع أثناء توليد النصائح.',
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
