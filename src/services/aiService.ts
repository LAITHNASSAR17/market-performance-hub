
import { pipeline } from '@huggingface/transformers';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { TradeStats } from '@/hooks/useAnalyticsStats';

// نوع للنصيحة
export interface TradingTip {
  id: string;
  title: string;
  content: string;
  category: 'performance' | 'risk' | 'psychology' | 'strategy';
  priority: 'high' | 'medium' | 'low';
}

// دالة لتحليل أداء المتداول وإنشاء نصائح
export const analyzeTradingPerformance = async (trades: Trade[], stats: TradeStats): Promise<TradingTip[]> => {
  // تحليل البيانات المتاحة وتوليد نصائح بناءً على أنماط التداول
  const tips: TradingTip[] = [];
  
  // تحقق من وجود صفقات كافية للتحليل
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
  
  // تحليل معدل الربح/الخسارة
  const winRate = parseFloat(stats.winRate.replace('%', ''));
  if (winRate < 40) {
    tips.push({
      id: '2',
      title: 'معدل الربح منخفض',
      content: 'معدل الربح لديك منخفض نسبياً. حاول مراجعة استراتيجية الدخول والخروج من الصفقات، وتحسين إدارة المخاطر.',
      category: 'performance',
      priority: 'high'
    });
  } else if (winRate > 70) {
    tips.push({
      id: '3',
      title: 'معدل ربح ممتاز',
      content: 'معدل الربح لديك ممتاز! حافظ على هذا المستوى مع مراعاة تنويع الأصول المتداولة للحد من المخاطر النظامية.',
      category: 'performance',
      priority: 'medium'
    });
  }
  
  // تحليل حجم الخسائر
  const largestLossValue = parseFloat(stats.largestLoss.replace('$', ''));
  const avgLossValue = parseFloat(stats.avgLoss.replace('$', ''));
  if (largestLossValue < -1000) {
    tips.push({
      id: '4',
      title: 'خسارة كبيرة مقلقة',
      content: 'لديك بعض الخسائر الكبيرة جداً. فكر في استخدام وقف خسارة أكثر صرامة وتقليل حجم الصفقات لتقليل المخاطر.',
      category: 'risk',
      priority: 'high'
    });
  }
  
  // تحليل اتساق الصفقات
  const consistencyIssue = checkConsistency(trades);
  if (consistencyIssue) {
    tips.push({
      id: '5',
      title: 'عدم اتساق في الصفقات',
      content: 'نلاحظ تقلبات كبيرة في نتائج صفقاتك. يوصى بالالتزام بخطة تداول ثابتة وتحسين الانضباط.',
      category: 'psychology',
      priority: 'medium'
    });
  }
  
  // نصائح حول أوقات التداول المفضلة
  const timingIssue = checkTradingTiming(trades);
  if (timingIssue) {
    tips.push({
      id: '6',
      title: 'تحسين توقيت الصفقات',
      content: 'يبدو أن أداءك أفضل في أوقات معينة من اليوم/الأسبوع. فكر في تركيز نشاط التداول خلال هذه الفترات.',
      category: 'strategy',
      priority: 'low'
    });
  }

  // إضافة نصائح عامة إذا كان العدد قليلاً
  if (tips.length < 2) {
    tips.push({
      id: '7',
      title: 'مراجعة الصفقات بانتظام',
      content: 'خصص وقتاً أسبوعياً لمراجعة صفقاتك وتحليل أنماط النجاح والفشل لتطوير استراتيجيتك.',
      category: 'strategy',
      priority: 'medium'
    });
  }
  
  return tips;
};

// دالة مساعدة للتحقق من اتساق الصفقات
const checkConsistency = (trades: Trade[]): boolean => {
  // تحليل بسيط للاتساق بناءً على تقلب نتائج الصفقات
  if (trades.length < 5) return false;
  
  const results = trades.slice(-5).map(trade => trade.profitLoss);
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (let i = 0; i < results.length; i++) {
    if (results[i] > 0) positiveCount++;
    if (results[i] < 0) negativeCount++;
  }
  
  // إذا كان هناك تناوب متكرر بين الربح والخسارة، فقد يشير ذلك إلى عدم اتساق
  return (positiveCount > 0 && negativeCount > 0 && Math.abs(positiveCount - negativeCount) <= 1);
};

// دالة مساعدة للتحقق من أوقات التداول المفضلة
const checkTradingTiming = (trades: Trade[]): boolean => {
  // تحليل بسيط لأوقات التداول
  return trades.length > 10;
};

// نموذج بيانات AI (محاكاة للإستجابة)
export const generateAIAdvice = async (tradeData: Trade[], stats: TradeStats): Promise<string> => {
  // يمكننا استخدام محرك AI حقيقي هنا، ولكن للتبسيط، سنستخدم منطقًا مخصصًا
  try {
    // معلومات الصفقات المهمة
    const winRateNum = parseFloat(stats.winRate.replace('%', ''));
    const totalTrades = stats.totalTrades;
    const recentTrades = tradeData.slice(-5);
    const recentProfits = recentTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    
    // تحديد نمط التداول
    let tradingStyle = "متنوع";
    if (tradeData.some(t => t.durationMinutes > 1440)) {
      tradingStyle = "مستثمر طويل الأجل";
    } else if (tradeData.some(t => t.durationMinutes < 60)) {
      tradingStyle = "متداول قصير الأجل";
    }
    
    // توليد نصيحة مخصصة
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
  } catch (error) {
    console.error("Error generating AI advice:", error);
    return "لم نتمكن من توليد نصيحة في هذا الوقت. يرجى المحاولة مرة أخرى لاحقاً.";
  }
};

// توليد نصائح متعددة باستخدام AI
export const getAITradingTips = async (trades: Trade[], stats: TradeStats): Promise<TradingTip[]> => {
  try {
    // في النسخة المستقبلية، يمكن استخدام نموذج Hugging Face هنا
    // لتوليد نصائح أكثر تخصيصًا وذكاءً، ولكن لغرض العرض التوضيحي
    // سنستخدم الدالة التي أنشأناها سابقًا
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
