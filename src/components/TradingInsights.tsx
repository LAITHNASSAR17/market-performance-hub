
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrade } from '@/contexts/TradeContext';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { useInsights } from '@/hooks/useInsights';
import { InsightCardContent } from './insights/InsightCardContent';
import { InsightNavigation } from './insights/InsightNavigation';

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

  const {
    currentInsight,
    loading,
    error,
    handleNext,
    handlePrevious,
    refreshInsights,
    currentInsightData,
    insights
  } = useInsights({
    trades,
    stats,
    playbooks,
    timeRange
  });

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
              onClick={refreshInsights} 
              variant="outline"
              className="mt-2"
              disabled={loading}
            >
              {t('إعادة المحاولة')}
            </Button>
          </div>
        ) : (
          <InsightCardContent 
            insight={currentInsightData}
            loading={loading}
            tradesCount={trades.length}
          />
        )}
      </CardContent>
      
      {!error && insights.length > 0 && (
        <InsightNavigation
          currentInsight={currentInsight}
          totalInsights={insights.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </Card>
  );
};

export default TradingInsights;
