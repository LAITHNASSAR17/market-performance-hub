
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
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'أنت مستشار تداول محترف. قم بتحليل بيانات التداول وقدم نصائح محددة وقابلة للتنفيذ باللغة العربية. ركز على إدارة المخاطر والجوانب النفسية وتحسين الاستراتيجية.'
          },
          {
            role: 'user',
            content: `
              يرجى تحليل بيانات التداول هذه وتقديم 3 نصائح محددة بتنسيق JSON.
              بيانات التداول: ${JSON.stringify(trades)}
              الإحصائيات: ${JSON.stringify(stats)}
              
              قم بإرجاع الرد بهذا التنسيق JSON بالضبط:
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
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data);
    
    let tips;
    try {
      tips = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return new Response(JSON.stringify({ error: 'Invalid response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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
