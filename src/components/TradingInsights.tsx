
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrade } from '@/contexts/TradeContext';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { useInsights } from '@/hooks/useInsights';
import { InsightCardContent } from './insights/InsightCardContent';
import { InsightNavigation } from './insights/InsightNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionInsights from './insights/SessionInsights';

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
            {t('Trading Insights')}
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
          {t('Custom insights based on your trading patterns')}
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="ai-insights">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="session-analysis">Session Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-insights">
          <CardContent>
            <InsightCardContent 
              insight={currentInsightData}
              loading={loading}
              tradesCount={trades.length}
            />
          </CardContent>
          
          {!error && insights.length > 0 && (
            <InsightNavigation
              currentInsight={currentInsight}
              totalInsights={insights.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
        </TabsContent>
        
        <TabsContent value="session-analysis">
          <CardContent className="p-0">
            <SessionInsights trades={trades} />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TradingInsights;
