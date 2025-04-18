
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
        JSON.stringify({
          analysis: 'أضف المزيد من الصفقات للحصول على تحليل مفصل لأدائك'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `
      أنت مستشار تداول محترف متخصص في تحليل أداء المتداولين. مهمتك هي:
      1. تحليل بيانات التداول الخاصة بالمتداول بدقة
      2. تقديم تحليل شامل ومفصل باللغة العربية عن أداء المتداول
      3. التركيز على الإيجابيات والسلبيات في طريقة التداول
      4. تقديم توصيات عملية لتحسين الأداء
      5. تلخيص النقاط الرئيسية في تحليلك
      
      اجعل تحليلك:
      - مخصصاً لبيانات المتداول المحددة
      - مدعوماً بالأرقام من بيانات المتداول
      - واضحاً ومنظماً
      - يتضمن تقييم إدارة المخاطر، والجوانب النفسية، والاستراتيجيات المستخدمة
    `;

    const userPrompt = `
      بيانات التداول:
      
      - عدد الصفقات: ${trades.length}
      - نسبة الربح: ${stats.winRate}%
      - متوسط الربح: ${stats.avgWin}
      - متوسط الخسارة: ${stats.avgLoss}
      - معامل الربح: ${stats.profitFactor}
      
      قم بإنشاء تحليل مفصل لأداء المتداول. التحليل يجب أن يكون باللغة العربية ومناسباً لعرضه في لوحة التحكم الخاصة بالمتداول.
      
      يجب أن يتضمن التحليل:
      1. نظرة عامة على الأداء.
      2. تحليل للنقاط القوية والضعيفة.
      3. توصيات واضحة لتحسين الأداء.
      4. تعليق على إدارة المخاطر وتوازن الربح/الخسارة.
      
      كن دقيقاً ومفيداً. اجعل التحليل محفزاً وبناءً.
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
        max_tokens: 1500
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data);
    
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      throw new Error(data.error.message);
    }

    const analysis = data.choices[0]?.message?.content || 
      "عذراً، لم أتمكن من توليد تحليل في هذا الوقت. يرجى المحاولة مرة أخرى لاحقاً.";
    
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating advice:', error);
    return new Response(JSON.stringify({ 
      analysis: "عذراً، حدث خطأ في توليد التحليل. يرجى المحاولة مرة أخرى لاحقاً." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
