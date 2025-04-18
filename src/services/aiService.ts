
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
  if (trades.length < 3) {
    return [{
      id: '1',
      title: 'أضف المزيد من الصفقات',
      content: 'نحتاج المزيد من الصفقات لتقديم تحليل دقيق لأدائك',
      category: 'performance',
      priority: 'medium'
    }];
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-trading-tips', {
      body: { trades, stats }
    });

    if (error) {
      console.error("Error getting AI trading tips:", error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid response format from AI service");
    }

    return data;
  } catch (error) {
    console.error("Error getting AI trading tips:", error);
    return [{
      id: '1',
      title: 'راجع استراتيجيتك',
      content: 'قم بمراجعة وتحليل صفقاتك الأخيرة لتحديد نقاط القوة والضعف',
      category: 'strategy',
      priority: 'high'
    }];
  }
};

export const generateAIAdvice = async (trades: Trade[], stats: TradeStats): Promise<string> => {
  if (trades.length < 3) {
    return "أضف المزيد من الصفقات للحصول على تحليل مفصل لأدائك";
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-trading-advice', {
      body: { trades, stats }
    });

    if (error) {
      console.error("Error generating AI advice:", error);
      throw error;
    }

    return data?.analysis || "عذراً، حدث خطأ في توليد التحليل. يرجى المحاولة مرة أخرى لاحقاً.";
  } catch (error) {
    console.error("Error generating AI advice:", error);
    return "عذراً، حدث خطأ في توليد التحليل. يرجى المحاولة مرة أخرى لاحقاً.";
  }
};
