import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { TradingTip, getAITradingTips, generateAIAdvice } from '@/services/aiService';
import { useTrade } from '@/contexts/TradeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { useToast } from "@/hooks/use-toast";
interface TradingTipsProps {
  className?: string;
}
const TradingTips: React.FC<TradingTipsProps> = ({
  className = ''
}) => {
  const {
    trades
  } = useTrade();
  const {
    t
  } = useLanguage();
  const stats = useAnalyticsStats();
  const {
    toast
  } = useToast();
  const [tips, setTips] = useState<TradingTip[]>([]);
  const [currentTip, setCurrentTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  useEffect(() => {
    // Load tips when data changes and there are trades
    if (trades.length > 0 && stats && !loading) {
      loadTips();
      loadAIAdvice();
    }
  }, [trades, stats]);
  const loadTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const newTips = await getAITradingTips(trades, stats);
      setTips(newTips);
      if (newTips.length > 0) {
        setCurrentTip(0);
      }
    } catch (error) {
      console.error("Error loading tips:", error);
      setError("حدث خطأ أثناء تحميل النصائح");
      toast({
        title: "خطأ في التحليل",
        description: "تعذر توليد النصائح. يرجى المحاولة مرة أخرى لاحقاً.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const loadAIAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const advice = await generateAIAdvice(trades, stats);
      setAiAdvice(advice);
    } catch (error) {
      console.error("Error loading AI advice:", error);
      toast({
        title: "خطأ في التحليل",
        description: "تعذر توليد التحليل المفصل. يرجى المحاولة مرة أخرى لاحقاً.",
        variant: "destructive"
      });
    } finally {
      setLoadingAdvice(false);
    }
  };
  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      setCurrentTip(0);
    }
  };
  const handlePrevious = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    } else {
      setCurrentTip(tips.length - 1);
    }
  };
  const refreshTips = () => {
    loadTips();
    loadAIAdvice();
    toast({
      title: "جارٍ تحديث التحليل",
      description: "يتم تحديث النصائح والتحليلات"
    });
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'risk':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'psychology':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'strategy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  const translateCategory = (category: string) => {
    switch (category) {
      case 'performance':
        return t('Performance') || 'Performance';
      case 'risk':
        return t('Risk') || 'Risk';
      case 'psychology':
        return t('Psychology') || 'Psychology';
      case 'strategy':
        return t('Strategy') || 'Strategy';
      default:
        return category;
    }
  };
  const translatePriority = (priority: string) => {
    switch (priority) {
      case 'high':
        return t('High') || 'High';
      case 'medium':
        return t('Medium') || 'Medium';
      case 'low':
        return t('Low') || 'Low';
      default:
        return priority;
    }
  };
  useEffect(() => {
    // Load tips when component first loads
    if (tips.length === 0 && !loading) {
      loadTips();
    }

    // Load AI advice
    if (aiAdvice === '' && !loadingAdvice) {
      loadAIAdvice();
    }
  }, []);
  return;
};
export default TradingTips;