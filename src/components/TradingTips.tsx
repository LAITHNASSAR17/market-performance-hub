
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
      setError("Error loading tips");
      toast({
        title: "Analysis Error",
        description: "Failed to generate tips. Please try again later.",
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
        title: "Analysis Error",
        description: "Failed to generate detailed analysis. Please try again later.",
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
      title: "Updating Analysis",
      description: "Updating tips and analysis"
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
        return 'Performance';
      case 'risk':
        return 'Risk';
      case 'psychology':
        return 'Psychology';
      case 'strategy':
        return 'Strategy';
      default:
        return category;
    }
  };

  const translatePriority = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return priority;
    }
  };

  useEffect(() => {
    if (tips.length === 0 && !loading) {
      loadTips();
    }

    if (aiAdvice === '' && !loadingAdvice) {
      loadAIAdvice();
    }
  }, []);

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Trading Tips
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={refreshTips} disabled={loading || loadingAdvice}>
          <RefreshCw className={`h-4 w-4 ${loading || loadingAdvice ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="flex items-center text-red-500 gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Add more trades to get personalized tips
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              {tips[currentTip] && (
                <>
                  <Badge className={getCategoryColor(tips[currentTip].category)}>
                    {translateCategory(tips[currentTip].category)}
                  </Badge>
                  <Badge className={getPriorityColor(tips[currentTip].priority)}>
                    {translatePriority(tips[currentTip].priority)}
                  </Badge>
                </>
              )}
            </div>
            
            {tips[currentTip] && (
              <>
                <h3 className="text-xl font-medium">{tips[currentTip].title}</h3>
                <p className="text-muted-foreground">
                  {tips[currentTip].content}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
      
      {tips.length > 1 && (
        <CardFooter className="flex justify-between pt-0">
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Tip
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNext}>
            Next Tip
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TradingTips;
