
import { useState, useEffect, useCallback } from 'react';
import { TradingInsight, generateTradingInsights } from '@/services/aiService';
import { Trade } from '@/contexts/TradeContext';
import { TradeStats } from '@/hooks/useAnalyticsStats';
import { useToast } from "@/hooks/use-toast";

export interface UseInsightsProps {
  trades: Trade[];
  stats: TradeStats;
  playbooks: any[];
  timeRange?: string;
}

export const useInsights = ({ trades, stats, playbooks, timeRange = 'all' }: UseInsightsProps) => {
  const [insights, setInsights] = useState<TradingInsight[]>([]);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadInsights = useCallback(async () => {
    console.log('Loading insights with:', { 
      tradesCount: trades.length, 
      statsAvailable: !!stats, 
      playbooksCount: playbooks.length,
      timeRange 
    });
    
    if (trades.length === 0 || !stats) {
      console.log('Not enough data to generate insights');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Calling generateTradingInsights with data');
      const newInsights = await generateTradingInsights(trades, stats, playbooks, timeRange);
      
      console.log('Received insights:', newInsights);
      
      // Validate insights
      if (Array.isArray(newInsights) && newInsights.length > 0) {
        setInsights(newInsights);
        setCurrentInsight(0);
      } else {
        console.warn('No insights generated, setting default message');
        setInsights([{
          id: 'no-data',
          title: 'لا توجد رؤى متاحة',
          content: 'أضف المزيد من الصفقات للحصول على تحليل أكثر تفصيلاً.',
          category: 'data',
          importance: 'medium'
        }]);
      }
    } catch (error) {
      console.error("Error loading insights:", error);
      setError("حدث خطأ أثناء توليد الرؤى التحليلية");
      toast({
        title: "خطأ في التحليل",
        description: "تعذر توليد الرؤى التحليلية. يرجى التحقق من إعدادات API.",
        variant: "destructive"
      });
      
      // Set fallback insights with more detailed error logging
      setInsights([{
        id: 'error-fallback',
        title: 'خطأ في التحليل',
        content: 'تعذر الاتصال بخدمة التحليل. يرجى المحاولة مرة أخرى أو التحقق من الإعدادات.',
        category: 'error',
        importance: 'high'
      }]);
    } finally {
      setLoading(false);
    }
  }, [trades, stats, playbooks, timeRange, toast]);

  const handleNext = () => {
    setCurrentInsight(prev => 
      prev < insights.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevious = () => {
    setCurrentInsight(prev => 
      prev > 0 ? prev - 1 : insights.length - 1
    );
  };

  const refreshInsights = () => {
    if (!loading && trades.length > 0) {
      loadInsights();
      toast({
        title: "جارٍ تحديث التحليل",
        description: "يتم تحديث الرؤى التحليلية للصفقات",
      });
    }
  };

  // Load insights when trades or stats change
  useEffect(() => {
    if (trades.length > 0 && stats) {
      loadInsights();
    }
  }, [trades, stats, timeRange, loadInsights]);

  return {
    insights,
    currentInsight,
    loading,
    error,
    handleNext,
    handlePrevious,
    refreshInsights,
    currentInsightData: insights[currentInsight]
  };
};
