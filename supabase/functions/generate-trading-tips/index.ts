
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

    const systemPrompt = `
      أنت مستشار تداول محترف متخصص في تحليل أداء المتداولين. مهمتك هي:
      1. تحليل بيانات التداول الخاصة بالمتداول بدقة
      2. تقديم نصائح محددة وعملية باللغة العربية
      3. التركيز على إدارة المخاطر، الجوانب النفسية، وتحسين الاستراتيجية
      4. تقديم توصيات مبنية على البيانات الفعلية للمتداول
      
      اجعل نصائحك:
      - عملية وقابلة للتنفيذ
      - مدعومة بالأرقام من بيانات المتداول
      - مخصصة لنمط تداول المتداول
      - موجهة لتحسين نقاط الضعف وتعزيز نقاط القوة
    `;

    const userPrompt = `
      تحليل أداء المتداول:
      
      البيانات:
      - عدد الصفقات: ${trades.length}
      - نسبة الربح: ${stats.winRate}%
      - متوسط الربح: ${stats.avgWin}
      - متوسط الخسارة: ${stats.avgLoss}
      - معامل الربح: ${stats.profitFactor}
      
      قم بتقديم 3 نصائح مهمة بناءً على هذه البيانات. اجعل النصائح متنوعة بين فئات:
      - الأداء (performance)
      - إدارة المخاطر (risk)
      - الجانب النفسي (psychology)
      - الاستراتيجية (strategy)
      
      أرجع النصائح بتنسيق JSON بالضبط كما يلي:
      [
        {
          "id": "1",
          "title": "عنوان النصيحة",
          "content": "محتوى النصيحة",
          "category": "performance|risk|psychology|strategy",
          "priority": "high|medium|low"
        }
      ]
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data);
    
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      throw new Error(data.error.message);
    }

    let tips;
    try {
      const content = data.choices[0].message.content;
      tips = JSON.parse(content).tips || [];
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
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
