
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

const TradingTips: React.FC<TradingTipsProps> = ({ className = '' }) => {
  const { trades } = useTrade();
  const { t } = useLanguage();
  const stats = useAnalyticsStats();
  const { toast } = useToast();
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
      description: "يتم تحديث النصائح والتحليلات",
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

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              {t('AI Trading Tips') || 'AI Trading Tips'}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={refreshTips} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            {t('Personalized tips based on your trading patterns') || 'Personalized tips based on your trading patterns'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="text-center py-4 space-y-3">
              <div className="flex justify-center mb-2">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-red-500">{t('عذراً، حدث خطأ')}</h3>
              <p className="text-muted-foreground">
                {t('حدث خطأ أثناء تحليل بياناتك. يرجى المحاولة مرة أخرى لاحقاً.')}
              </p>
              <Button 
                onClick={refreshTips} 
                variant="outline"
                className="mt-2"
                disabled={loading}
              >
                {t('إعادة المحاولة')}
              </Button>
            </div>
          ) : tips.length > 0 ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge className={getCategoryColor(tips[currentTip].category)}>
                  {translateCategory(tips[currentTip].category)}
                </Badge>
                <Badge className={getPriorityColor(tips[currentTip].priority)}>
                  {translatePriority(tips[currentTip].priority)}
                </Badge>
              </div>
              
              <h3 className="text-xl font-medium">{tips[currentTip].title}</h3>
              <p className="text-muted-foreground">{tips[currentTip].content}</p>
            </div>
          ) : loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse">
                {t('Analyzing your data...') || 'Analyzing your data...'}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              {t('Add more trades to receive personalized tips') || 'Add more trades to receive personalized tips'}
            </div>
          )}
        </CardContent>
        
        {tips.length > 1 && (
          <CardFooter className="flex justify-between pt-0">
            <Button variant="ghost" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentTip + 1} / {tips.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Detailed Trading Advice */}
      {aiAdvice && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t('AI Custom Analysis') || 'AI Custom Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAdvice ? (
              <div className="text-center py-2">
                <div className="animate-pulse">
                  {t('Generating analysis...') || 'Generating analysis...'}
                </div>
              </div>
            ) : (
              <p className="text-sm">{aiAdvice}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingTips;
