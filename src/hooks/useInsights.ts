
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();

  const loadInsights = async () => {
    setLoading(true);
    try {
      const newInsights = await generateTradingInsights(trades, stats, playbooks, timeRange);
      setInsights(newInsights);
      if (newInsights.length > 0) {
        setCurrentInsight(0);
      }
    } catch (error) {
      console.error("Error loading insights:", error);
      toast({
        title: "خطأ في تحليل البيانات",
        description: "حدث خطأ أثناء تحليل بياناتك. يرجى المحاولة مرة أخرى لاحقاً.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentInsight < insights.length - 1) {
      setCurrentInsight(currentInsight + 1);
    } else {
      setCurrentInsight(0);
    }
  };

  const handlePrevious = () => {
    if (currentInsight > 0) {
      setCurrentInsight(currentInsight - 1);
    } else {
      setCurrentInsight(insights.length - 1);
    }
  };

  const refreshInsights = () => {
    if (!loading) {
      loadInsights();
      toast({
        title: "جاري تحديث التحليل",
        description: "يتم الآن تحليل بياناتك وتوليد رؤى جديدة.",
      });
    }
  };

  useEffect(() => {
    if (trades.length > 0 && stats) {
      loadInsights();
    }
  }, [trades, stats, timeRange]);

  useEffect(() => {
    if (insights.length === 0 && !loading) {
      loadInsights();
    }
  }, []);

  return {
    insights,
    currentInsight,
    loading,
    handleNext,
    handlePrevious,
    refreshInsights,
    currentInsightData: insights[currentInsight]
  };
};
