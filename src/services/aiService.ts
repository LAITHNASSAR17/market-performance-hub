
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
  console.log('Getting AI trading tips', { 
    tradesCount: trades.length
  });
  
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
    console.log('Invoking generate-trading-insights function for tips');
    const { data, error } = await supabase.functions.invoke('generate-trading-insights', {
      body: { trades, stats, purpose: 'tips' }
    });

    console.log('Function invoke result for tips:', { data, error });

    if (error) {
      console.error("Error getting AI trading tips:", error);
      throw error;
    }

    if (!data || !data.insights || !Array.isArray(data.insights)) {
      console.error("Invalid response format from AI service:", data);
      throw new Error("Invalid response format from AI service");
    }

    // Convert insights format to tips format
    return data.insights.map((insight: TradingInsight) => ({
      id: insight.id,
      title: insight.title,
      content: insight.content,
      category: insight.category as 'performance' | 'risk' | 'psychology' | 'strategy',
      priority: insight.importance as 'high' | 'medium' | 'low'
    }));
  } catch (error) {
    console.error("Error getting AI trading tips:", error);
    return [{
      id: 'error-1',
      title: 'عذراً، حدث خطأ',
      content: 'حدث خطأ أثناء توليد النصائح. يرجى المحاولة مرة أخرى لاحقاً.',
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
    console.log('Invoking generate-trading-insights function for advice');
    const { data, error } = await supabase.functions.invoke('generate-trading-insights', {
      body: { trades, stats, purpose: 'advice' }
    });

    console.log('Function invoke result for advice:', { data, error });

    if (error) {
      console.error("Error generating AI advice:", error);
      throw error;
    }

    // Return a summary of all insights as advice
    if (data && data.insights && Array.isArray(data.insights)) {
      return data.insights
        .map((insight: TradingInsight) => `${insight.title}: ${insight.content}`)
        .join('\n\n');
    }

    return "لم يتم العثور على تحليل مناسب. يرجى المحاولة مرة أخرى.";
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
