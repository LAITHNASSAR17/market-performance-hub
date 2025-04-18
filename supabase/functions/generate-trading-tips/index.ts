
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional trading advisor. Analyze trading data and provide specific, actionable advice in Arabic. Focus on risk management, psychological aspects, and strategy improvement.'
          },
          {
            role: 'user',
            content: `
              Please analyze this trading data and provide 3 specific tips in JSON format.
              Trading Data: ${JSON.stringify(trades)}
              Statistics: ${JSON.stringify(stats)}
              
              Return the response in this exact JSON format:
              [
                {
                  "id": "1",
                  "title": "عنوان النصيحة",
                  "content": "محتوى النصيحة",
                  "category": "performance|risk|psychology|strategy",
                  "priority": "high|medium|low"
                }
              ]
            `
          }
        ],
      }),
    });

    const data = await response.json();
    const tips = JSON.parse(data.choices[0].message.content);
    
    return new Response(JSON.stringify(tips), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating tips:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
