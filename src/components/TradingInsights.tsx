import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft, 
  Lightbulb, 
  Brain, 
  AlertTriangle, 
  BarChart3, 
  Gauge, 
  Heart, 
  Target 
} from 'lucide-react';
import { TradingInsight, generateTradingInsights } from '@/services/aiService';
import { useTrade } from '@/contexts/TradeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface TradingInsightsProps {
  className?: string;
  timeRange?: string;
}

const TradingInsights: React.FC<TradingInsightsProps> = ({ 
  className = '',
  timeRange = 'all'
}) => {
  const { trades } = useTrade();
  const { t } = useLanguage();
  const stats = useAnalyticsStats();
  const { playbooks } = usePlaybooks();
  const { toast } = useToast();
  const [insights, setInsights] = useState<TradingInsight[]>([]);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trades.length > 0 && stats) {
      loadInsights();
    }
  }, [trades, stats, timeRange]);

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'psychology':
        return <Brain className="h-4 w-4" />;
      case 'strategy':
        return <Target className="h-4 w-4" />;
      case 'pattern':
        return <Gauge className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
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
      case 'pattern':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'data':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
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

  const translateCategory = (category: string) => {
    switch (category) {
      case 'performance':
        return 'الأداء';
      case 'risk':
        return 'المخاطر';
      case 'psychology':
        return 'النفسية';
      case 'strategy':
        return 'الاستراتيجية';
      case 'pattern':
        return 'الأنماط';
      case 'data':
        return 'البيانات';
      case 'error':
        return 'خطأ';
      default:
        return category;
    }
  };

  const translateImportance = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'مرتفعة';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return importance;
    }
  };

  useEffect(() => {
    if (insights.length === 0 && !loading) {
      loadInsights();
    }
  }, []);

  return (
    <Card className={`shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            {t('تحليل ذكي للتداول')}
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshInsights} 
              disabled={loading}
              className="relative"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          {t('رؤى مخصصة بناءً على أنماط التداول الخاصة بك')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Badge className={getCategoryColor(insights[currentInsight].category)}>
                {getCategoryIcon(insights[currentInsight].category)}
                <span className="mr-1">{translateCategory(insights[currentInsight].category)}</span>
              </Badge>
              <Badge className={getImportanceColor(insights[currentInsight].importance)}>
                {translateImportance(insights[currentInsight].importance)}
              </Badge>
            </div>
            
            <h3 className="text-xl font-medium">{insights[currentInsight].title}</h3>
            <div className="text-muted-foreground whitespace-pre-line">
              {insights[currentInsight].content}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {trades.length < 5 
                ? t('أضف المزيد من الصفقات للحصول على رؤى مخصصة') 
                : t('اضغط على زر التحديث للحصول على رؤى تداول ذكية')}
            </p>
          </div>
        )}
      </CardContent>
      
      {insights.length > 1 && (
        <CardFooter className="flex justify-between pt-0">
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentInsight + 1} / {insights.length}
          </span>
          <Button variant="ghost" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TradingInsights;
