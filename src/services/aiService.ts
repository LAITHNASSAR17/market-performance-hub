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

export interface TradingInsight {
  id: string;
  title: string;
  content: string;
  category: 'performance' | 'psychology' | 'risk' | 'strategy' | 'pattern' | 'data' | 'error';
  importance: 'high' | 'medium' | 'low';
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
    console.log('Calling generate-trading-tips function');
    const { data, error } = await supabase.functions.invoke('generate-trading-tips', {
      body: { trades, stats }
    });

    if (error) {
      console.error("Error getting AI trading tips:", error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.error("Invalid response format from AI service:", data);
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
    console.log('Calling generate-trading-advice function');
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

export const generateTradingInsights = async (
  trades: Trade[], 
  stats: TradeStats,
  playbooks: any[] = [],
  timeRange: string = 'all'
): Promise<TradingInsight[]> => {
  console.log('Generating trading insights', { 
    tradesCount: trades.length, 
    timeRange 
  });

  if (trades.length < 5) {
    console.log('Not enough trades to generate insights');
    return [{
      id: 'data-1',
      title: 'نحتاج المزيد من البيانات',
      content: 'أضف المزيد من الصفقات للحصول على تحليل أكثر دقة. نحتاج على الأقل 5 صفقات.',
      category: 'data',
      importance: 'high'
    }];
  }

  try {
    console.log('Invoking generate-trading-insights function');
    const { data, error } = await supabase.functions.invoke('generate-trading-insights', {
      body: { trades, stats, playbooks, timeRange }
    });

    console.log('Function invoke result:', { data, error });

    if (error) {
      console.error("Error generating trading insights:", error);
      throw error;
    }

    if (!data || !data.insights || !Array.isArray(data.insights)) {
      console.error("Invalid response format from AI service:", data);
      throw new Error("Invalid response format from AI service");
    }

    return data.insights;
  } catch (error) {
    console.error("Comprehensive error generating trading insights:", error);
    return [{
      id: 'error-1',
      title: 'عذراً، حدث خطأ',
      content: 'حدث خطأ أثناء تحليل بياناتك. يرجى المحاولة مرة أخرى لاحقاً.',
      category: 'error',
      importance: 'high'
    }];
  }
};
