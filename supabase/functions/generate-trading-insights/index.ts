
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
    const { trades, stats, playbooks, timeRange } = await req.json();

    if (!trades || trades.length < 5) {
      return new Response(
        JSON.stringify({
          insights: [{
            id: '1',
            title: 'نحتاج المزيد من البيانات',
            content: 'أضف المزيد من الصفقات للحصول على تحليل أكثر دقة. نحتاج على الأقل 5 صفقات.',
            category: 'data',
            importance: 'high'
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify API key exists and is valid
    if (!deepseekApiKey) {
      console.error('Deepseek API key is not available');
      return new Response(
        JSON.stringify({
          insights: [{
            id: 'error-api-key',
            title: 'مفتاح API غير متوفر',
            content: 'مفتاح API الخاص بـ Deepseek غير متوفر. يرجى التحقق من إعدادات المشروع وإضافة مفتاح صالح.',
            category: 'error',
            importance: 'high'
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    `;

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
      console.log('Calling Deepseek API for trading insights');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      console.log('Deepseek Response:', data);
      
      if (data.error) {
        console.error('Deepseek API Error:', data.error);
        
        return new Response(
          JSON.stringify({ insights: generateFallbackInsights() }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse the Deepseek response
      const content = data.choices[0]?.message?.content;
      if (!content) {
        console.error('No content in Deepseek response');
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
        
        console.log('Successfully parsed insights:', insights.length);
      } catch (e) {
        console.error('Error parsing Deepseek response:', e);
        return new Response(
          JSON.stringify({ insights: generateFallbackInsights() }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error calling Deepseek API:', error);
      
      return new Response(
        JSON.stringify({ insights: generateFallbackInsights() }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    
    return new Response(JSON.stringify({ 
      insights: [{
        id: 'error',
        title: 'عذراً، حدث خطأ',
        content: 'حدث خطأ أثناء تحليل بياناتك. يرجى المحاولة مرة أخرى لاحقاً.',
        category: 'error',
        importance: 'high'
      }]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackInsights() {
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
}
