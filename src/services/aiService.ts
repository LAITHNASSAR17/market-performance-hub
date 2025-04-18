
import { Trade } from '@/contexts/TradeContext';
import { TradeStats } from '@/hooks/useAnalyticsStats';
import { supabase } from '@/lib/supabase';

export interface TradingTip {
  id: string;
  title: string;
  content: string;
  category: 'performance' | 'risk' | 'psychology' | 'strategy';
  priority: 'high' | 'medium' | 'low';
}

export const getAITradingTips = async (trades: Trade[], stats: TradeStats): Promise<TradingTip[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-trading-tips', {
      body: { trades, stats }
    });

    if (error) throw error;
    return data || getDefaultTips(trades);
  } catch (error) {
    console.error("Error getting AI trading tips:", error);
    return getDefaultTips(trades);
  }
};

const getDefaultTips = (trades: Trade[]): TradingTip[] => {
  if (trades.length < 3) {
    return [{
      id: '1',
      title: 'أضف المزيد من الصفقات',
      content: 'نحتاج المزيد من الصفقات لتقديم تحليل دقيق لأدائك',
      category: 'performance',
      priority: 'medium'
    }];
  }
  
  return [{
    id: '1',
    title: 'راجع استراتيجيتك',
    content: 'قم بمراجعة وتحليل صفقاتك الأخيرة لتحديد نقاط القوة والضعف',
    category: 'strategy',
    priority: 'high'
  }];
};

export const generateAIAdvice = async (trades: Trade[], stats: TradeStats): Promise<string> => {
  if (trades.length < 3) {
    return "أضف المزيد من الصفقات للحصول على تحليل مفصل لأدائك";
  }

  try {
    const { data: tips } = await supabase.functions.invoke('generate-trading-tips', {
      body: { trades, stats }
    });
    
    return tips?.[0]?.content || getDefaultTips(trades)[0].content;
  } catch (error) {
    console.error("Error generating AI advice:", error);
    return "عذراً، حدث خطأ في توليد النصائح. يرجى المحاولة مرة أخرى لاحقاً.";
  }
};
