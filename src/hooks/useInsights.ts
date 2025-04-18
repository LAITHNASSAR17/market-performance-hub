
import { useState, useEffect, useCallback } from 'react';
import { TradingInsight, generateTradingInsights } from '@/services/aiService';
import { Trade } from '@/contexts/TradeContext';
import { TradeStats } from '@/hooks/useAnalyticsStats';
import { useToast } from "@/hooks/use-toast";

interface UseInsightsProps {
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
    if (trades.length === 0 || !stats) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newInsights = await generateTradingInsights(trades, stats, playbooks, timeRange);
      
      // Validate insights
      if (Array.isArray(newInsights) && newInsights.length > 0) {
        setInsights(newInsights);
        setCurrentInsight(0);
      } else {
        // No insights available, set a default message
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
      
      // Set fallback insights
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
