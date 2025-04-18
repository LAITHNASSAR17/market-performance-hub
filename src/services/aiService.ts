
import { Trade } from '@/contexts/TradeContext';
import { TradeStats } from '@/hooks/useAnalyticsStats';
import { supabase } from '@/lib/supabase';

export interface TradingInsight {
  id: string;
  title: string;
  content: string;
  category: 'performance' | 'psychology' | 'risk' | 'strategy' | 'pattern' | 'data' | 'error';
  importance: 'high' | 'medium' | 'low';
}

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
