
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
    const { trades, stats, playbooks, timeRange } = await req.json();

    if (!trades || trades.length < 5) {
      return new Response(
        JSON.stringify({
          insights: [
            {
              id: '1',
              title: 'نحتاج المزيد من البيانات',
              content: 'أضف المزيد من الصفقات للحصول على تحليل أكثر دقة. نحتاج على الأقل 5 صفقات.',
              category: 'data',
              importance: 'high'
            }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OpenAI API key is available and valid
    if (!openAIApiKey || openAIApiKey.includes('github_p') || openAIApiKey.length < 20) {
      console.error('OpenAI API key is not valid or not available');
      return new Response(
        JSON.stringify({
          insights: [
            {
              id: 'error-api-key',
              title: 'مفتاح API غير صالح',
              content: 'مفتاح API الخاص بـ OpenAI غير صالح. يرجى التحقق من إعدادات المشروع وإضافة مفتاح صالح.',
              category: 'error',
              importance: 'high'
            }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate some fallback insights when API is not working properly
    const generateFallbackInsights = () => {
      return [
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
    };

    // Extract trade patterns and key metrics
    const tradeTags = trades.flatMap(trade => trade.hashtags || []);
    const uniqueTags = [...new Set(tradeTags)];
    
    const sessionDistribution = trades.reduce((acc, trade) => {
      const hour = new Date(trade.date + 'T' + (trade.entryTime || '00:00:00')).getHours();
      if (hour >= 8 && hour < 16) acc.london += 1;
      else if (hour >= 16 && hour < 24) acc.newyork += 1;
      else if (hour >= 0 && hour < 8) acc.asia += 1;
      return acc;
    }, { london: 0, newyork: 0, asia: 0 });
    
    const tagPerformance = uniqueTags.map(tag => {
      const tagTrades = trades.filter(trade => (trade.hashtags || []).includes(tag));
      const winRate = tagTrades.length > 0 
        ? (tagTrades.filter(t => t.total > 0).length / tagTrades.length) * 100 
        : 0;
      const avgProfit = tagTrades.length > 0
        ? tagTrades.reduce((sum, t) => sum + t.total, 0) / tagTrades.length
        : 0;
      
      return { tag, winRate, avgProfit, count: tagTrades.length };
    });

    const systemPrompt = `
      أنت مستشار تداول محترف متخصص في تحليل أداء المتداولين. مهمتك هي:
      
      1. تحليل بيانات التداول للمتداول وتقديم رؤى عميقة وتوصيات قابلة للتنفيذ.
      2. تحديد أنماط السلوك، نقاط الضعف والقوة، واستراتيجيات التداول الأكثر فعالية.
      3. التركيز على تحسين الأداء من خلال إبراز العلاقات بين عوامل مختلفة مثل:
         - الأزواج المتداولة وأداء المتداول
         - العلامات المرتبطة بالصفقات وتأثيرها على النتائج
         - جلسات التداول وفعالية الاستراتيجيات
         - الأنماط النفسية وأثرها على الأداء
      
      يجب أن يكون تحليلك:
      1. معتمداً على البيانات المقدمة
      2. مصاغاً باللغة العربية بشكل واضح ومباشر
      3. مرتباً من حيث الأهمية (الأكثر أهمية أولاً)
      4. قابل للتنفيذ عملياً من قبل المتداول
      
      المخرجات المطلوبة:
      قائمة من الرؤى التحليلية (insights) بتنسيق JSON، كل رؤية تتضمن:
      - عنوان (title): وصف قصير للرؤية
      - محتوى (content): شرح تفصيلي مع توصيات عملية
      - فئة (category): واحدة من: "performance", "psychology", "risk", "strategy", "pattern", "data"
      - أهمية (importance): "high", "medium", "low"
      
      ملاحظة: يجب أن تقدم ما بين 4-8 رؤى تحليلية مرتبة حسب الأهمية.
    `;

    // Prepare context data to send to OpenAI
    const userPrompt = `
      بيانات المتداول:
      
      إحصائيات الأداء:
      - عدد الصفقات: ${trades.length}
      - نسبة الربح: ${stats.winRate}
      - متوسط الربح: ${stats.avgWin}
      - متوسط الخسارة: ${stats.avgLoss}
      - معامل الربح: ${stats.profitFactor}
      - أكبر ربح: ${stats.largestWin}
      - أكبر خسارة: ${stats.largestLoss}
      
      توزيع العلامات الأكثر استخداماً:
      ${tagPerformance.sort((a, b) => b.count - a.count).slice(0, 10).map(t => 
        `- ${t.tag}: ${t.count} صفقة، نسبة ربح ${t.winRate.toFixed(1)}%، متوسط ربح ${t.avgProfit.toFixed(2)}`
      ).join('\n')}
      
      توزيع الصفقات على جلسات التداول:
      - جلسة لندن: ${sessionDistribution.london} صفقة
      - جلسة نيويورك: ${sessionDistribution.newyork} صفقة
      - جلسة آسيا: ${sessionDistribution.asia} صفقة
      
      ${playbooks && playbooks.length > 0 ? `
      كتب الاستراتيجيات:
      ${playbooks.map(p => 
        `- ${p.name}: نسبة ربح ${p.winRate}%، متوسط ربح ${p.averageProfit || 0}، عدد صفقات ${p.totalTrades || 0}`
      ).join('\n')}
      ` : ''}
      
      الفترة الزمنية للتحليل: ${timeRange || 'all'}
      
      قم بتحليل هذه البيانات وإنتاج رؤى تحليلية (insights) مرتبة حسب الأهمية، تركز على تحسين أداء المتداول.
      قدم توصيات عملية قابلة للتنفيذ بناءً على الأنماط التي تلاحظها في البيانات.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      console.log('OpenAI Response:', data);
      
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        
        // Return fallback insights if OpenAI API fails
        return new Response(
          JSON.stringify({ insights: generateFallbackInsights() }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse the OpenAI response
      const content = data.choices[0]?.message?.content;
      if (!content) {
        return new Response(
          JSON.stringify({ insights: generateFallbackInsights() }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let insights;
      try {
        const parsedContent = JSON.parse(content);
        insights = parsedContent.insights || [];
        
        // Ensure each insight has an id
        insights = insights.map((insight, index) => ({
          ...insight,
          id: insight.id || `insight-${index + 1}`
        }));
      } catch (e) {
        console.error('Error parsing OpenAI response:', e);
        return new Response(
          JSON.stringify({ insights: generateFallbackInsights() }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Return fallback insights if OpenAI API fails
      return new Response(
        JSON.stringify({ insights: generateFallbackInsights() }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    
    return new Response(JSON.stringify({ 
      insights: [
        {
          id: 'error',
          title: 'عذراً، حدث خطأ',
          content: 'حدث خطأ أثناء تحليل بياناتك. يرجى المحاولة مرة أخرى لاحقاً.',
          category: 'error',
          importance: 'high'
        }
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
