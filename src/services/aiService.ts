
import { Trade } from '@/contexts/TradeContext';
import { TradeStats } from '@/hooks/useAnalyticsStats';

// نوع للنصيحة
export interface TradingTip {
  id: string;
  title: string;
  content: string;
  category: 'performance' | 'risk' | 'psychology' | 'strategy';
  priority: 'high' | 'medium' | 'low';
}

// مفتاح API الافتراضي
const DEFAULT_API_KEY = "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";

// دالة لإرسال طلب إلى Perplexity API
const callPerplexityAPI = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEFAULT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'أنت مستشار مالي ومتخصص في تحليل بيانات التداول. قدم نصائح مفيدة وعملية بناءً على بيانات التداول.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    return "";
  }
};

// دالة لتحليل أداء المتداول وإنشاء نصائح باستخدام Perplexity API
export const analyzeTradingPerformance = async (trades: Trade[], stats: TradeStats): Promise<TradingTip[]> => {
  // التحقق من وجود صفقات كافية للتحليل
  if (trades.length < 3) {
    return getDefaultTips(trades);
  }

  try {
    // إعداد البيانات للإرسال إلى API
    const tradeData = trades.slice(-10).map(trade => ({
      date: trade.date,
      pair: trade.pair,
      profitLoss: trade.profitLoss,
      durationMinutes: trade.durationMinutes,
      hashtags: trade.hashtags
    }));

    // إنشاء المطلب (prompt) للـ API
    const prompt = `
    قم بتحليل بيانات التداول التالية وقدم 3 نصائح مفيدة للمتداول.
    
    بيانات التداول:
    ${JSON.stringify(tradeData, null, 2)}
    
    إحصائيات:
    - إجمالي الصفقات: ${stats.totalTrades}
    - معدل الربح: ${stats.winRate}
    - متوسط الربح: ${stats.avgWin}
    - متوسط الخسارة: ${stats.avgLoss}
    - أكبر ربح: ${stats.largestWin}
    - أكبر خسارة: ${stats.largestLoss}
    
    قدم الإجابة بتنسيق JSON كالتالي:
    [
      {
        "id": "1",
        "title": "عنوان النصيحة الأولى",
        "content": "محتوى النصيحة الأولى",
        "category": "performance", // إختر من: performance, risk, psychology, strategy
        "priority": "high" // إختر من: high, medium, low
      },
      // نصائح إضافية...
    ]
    `;

    // استدعاء الـ API
    const apiResponse = await callPerplexityAPI(prompt);
    
    // تحليل الاستجابة JSON
    try {
      // استخراج نص JSON من الاستجابة (قد تحتوي على نص إضافي)
      const jsonMatch = apiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const tips = JSON.parse(jsonMatch[0]) as TradingTip[];
        return tips.map((tip, index) => ({
          ...tip,
          id: tip.id || `generated-${index+1}`
        }));
      }
    } catch (parseError) {
      console.error("Error parsing JSON from API response:", parseError);
    }
    
    // إذا فشلت عملية التحليل، استخدم النصائح الافتراضية
    return getDefaultTips(trades);
  } catch (error) {
    console.error("Error analyzing trading performance:", error);
    return getDefaultTips(trades);
  }
};

// دالة للحصول على نصائح افتراضية
const getDefaultTips = (trades: Trade[]): TradingTip[] => {
  if (trades.length < 3) {
    return [
      {
        id: '1',
        title: 'قم بإضافة المزيد من الصفقات',
        content: 'يُوصى بتسجيل المزيد من الصفقات لتلقي نصائح أكثر دقة بناءً على أنماط التداول الخاصة بك.',
        category: 'performance',
        priority: 'medium'
      }
    ];
  }
  
  return [
    {
      id: '2',
      title: 'مراجعة استراتيجيتك',
      content: 'قم بمراجعة استراتيجيتك بشكل دوري وحدد نقاط القوة والضعف. ركز على تطوير نقاط قوتك.',
      category: 'strategy',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'إدارة المخاطر',
      content: 'تأكد من عدم المخاطرة بأكثر من 1-2% من رأس المال في الصفقة الواحدة للحفاظ على استدامة حسابك.',
      category: 'risk',
      priority: 'high'
    },
    {
      id: '4',
      title: 'السيطرة على العواطف',
      content: 'تعلم التحكم في عواطفك أثناء التداول، خاصة بعد الخسائر. حافظ على التفكير بعقلانية.',
      category: 'psychology',
      priority: 'medium'
    }
  ];
};

// توليد نصيحة AI مفصلة
export const generateAIAdvice = async (tradeData: Trade[], stats: TradeStats): Promise<string> => {
  // التحقق من وجود صفقات كافية
  if (tradeData.length < 3) {
    return getDefaultAdvice(tradeData, stats);
  }

  try {
    // إعداد البيانات
    const recentTrades = tradeData.slice(-10);
    
    // إنشاء المطلب
    const prompt = `
    قم بتحليل بيانات التداول التالية وقدم نصيحة مفصلة للمتداول. قدم تحليلاً عميقاً وتوصيات محددة.
    
    بيانات التداول الأخيرة:
    ${JSON.stringify(recentTrades, null, 2)}
    
    إحصائيات:
    - إجمالي الصفقات: ${stats.totalTrades}
    - معدل الربح: ${stats.winRate}
    - متوسط الربح: ${stats.avgWin}
    - متوسط الخسارة: ${stats.avgLoss}
    - أكبر ربح: ${stats.largestWin}
    - أكبر خسارة: ${stats.largestLoss}
    
    قدم تحليلاً شاملاً لأدائه وتوصيات محددة لتحسين نتائجه. اجعل النصيحة موجزة ومفيدة.
    `;

    // استدعاء الـ API
    const advice = await callPerplexityAPI(prompt);
    return advice || getDefaultAdvice(tradeData, stats);
  } catch (error) {
    console.error("Error generating AI advice:", error);
    return getDefaultAdvice(tradeData, stats);
  }
};

// دالة للحصول على نصيحة افتراضية
const getDefaultAdvice = (tradeData: Trade[], stats: TradeStats): string => {
  const winRateNum = parseFloat(stats.winRate.replace('%', ''));
  const totalTrades = stats.totalTrades;
  const recentTrades = tradeData.slice(-5);
  const recentProfits = recentTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  
  let tradingStyle = "متنوع";
  if (tradeData.some(t => t.durationMinutes > 1440)) {
    tradingStyle = "مستثمر طويل الأجل";
  } else if (tradeData.some(t => t.durationMinutes < 60)) {
    tradingStyle = "متداول قصير الأجل";
  }
  
  let advice = `بناءً على تحليل ${totalTrades} صفقة، يبدو أنك ${tradingStyle} بمعدل ربح ${winRateNum.toFixed(1)}%. `;
  
  if (winRateNum > 50) {
    advice += "أداؤك جيد، لكن هناك دائماً مجال للتحسين. ";
  } else {
    advice += "يمكنك تحسين أدائك من خلال مراجعة استراتيجية الدخول والخروج. ";
  }
  
  if (recentProfits > 0) {
    advice += "صفقاتك الأخيرة إيجابية، استمر في تطبيق ما تعلمته مؤخراً. ";
  } else {
    advice += "صفقاتك الأخيرة لم تكن مربحة، خذ وقتاً للتأمل وتحليل أسباب الخسارة. ";
  }
  
  advice += "توصيتي الرئيسية: حافظ على الانضباط في اتباع خطة التداول، واستمر في توثيق كل صفقة لتحليلها لاحقاً.";
  
  return advice;
};

// توليد نصائح متعددة باستخدام الـ API
export const getAITradingTips = async (trades: Trade[], stats: TradeStats): Promise<TradingTip[]> => {
  try {
    return await analyzeTradingPerformance(trades, stats);
  } catch (error) {
    console.error("Error getting AI trading tips:", error);
    return [{
      id: 'error',
      title: 'حدث خطأ',
      content: 'لم نتمكن من توليد نصائح في هذا الوقت. يرجى المحاولة مرة أخرى لاحقاً.',
      category: 'performance',
      priority: 'medium'
    }];
  }
};
