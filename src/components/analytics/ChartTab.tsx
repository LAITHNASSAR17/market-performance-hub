
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RunningPLChart from '@/components/analytics/RunningPLChart';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from "@/components/ui/badge";
import { LineChart, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ChartTabProps {
  plData: { time: string; value: number }[];
}

const ChartTab: React.FC<ChartTabProps> = ({ plData }) => {
  const { t } = useLanguage();
  
  const riskManagementMetrics = [
    { name: 'Average R-Multiple', value: '2.3R', type: 'positive' },
    { name: 'Largest Winner', value: '6.8R', type: 'positive' },
    { name: 'Largest Loser', value: '-1.2R', type: 'negative' },
    { name: 'Win Rate', value: '62%', type: 'positive' },
    { name: 'Expected Value', value: '1.35R', type: 'positive' },
    { name: 'Risk Reward Ratio', value: '1:2.3', type: 'neutral' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              {t('analytics.runningPL') || 'Running P&L'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RunningPLChart data={plData} />
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{t('analytics.riskManagement') || 'Risk Management'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {riskManagementMetrics.map((metric, i) => (
                <div key={i} className="p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                  <div className={`text-xl font-semibold ${
                    metric.type === 'positive' ? 'text-green-500' : 
                    metric.type === 'negative' ? 'text-red-500' : ''
                  }`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">{t('analytics.rMultipleDesc') || 'What is R-Multiple?'}</div>
              <p className="text-sm text-muted-foreground">
                R-Multiple measures how much you make relative to what you risk. 2R means you made twice your risk amount. 
                Higher R-Multiple with good win rate leads to consistent profitability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.pairPerformance') || 'Pair Performance'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">EUR/USD</span>
                  <span className="text-sm font-medium text-green-500">+$850.00 (3.2R)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">GBP/USD</span>
                  <span className="text-sm font-medium text-green-500">+$320.00 (1.8R)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">USD/JPY</span>
                  <span className="text-sm font-medium text-red-500">-$150.00 (-0.7R)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">AUD/USD</span>
                  <span className="text-sm font-medium text-red-500">-$420.00 (-1.1R)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.bestWorstTradingDays') || 'Best & Worst Trading Days'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Thursday</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-500">+$650.00</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '92%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Win rate: 75% | Avg. R-Multiple: 2.8R
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monday</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-500">+$450.00</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '65%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Win rate: 68% | Avg. R-Multiple: 2.2R
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Friday</span>
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm font-medium text-red-500">-$240.00</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '35%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Win rate: 42% | Avg. R-Multiple: 0.8R
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tuesday</span>
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm font-medium text-red-500">-$120.00</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '18%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Win rate: 50% | Avg. R-Multiple: 0.9R
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            {t('analytics.riskFactors') || 'Risk Factors to Monitor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md bg-red-50">
              <div className="text-sm font-medium mb-2">Hesitation</div>
              <p className="text-sm text-muted-foreground">
                Your hesitation has cost you approximately <span className="font-medium text-red-500">$350</span> in missed opportunities.
                Consider practicing with smaller positions to build confidence.
              </p>
              <div className="mt-2 flex gap-1 flex-wrap">
                <Badge variant="outline" className="bg-red-100">hesitated</Badge>
                <Badge variant="outline" className="bg-red-100">missed entry</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-amber-50">
              <div className="text-sm font-medium mb-2">Poor Risk Management</div>
              <p className="text-sm text-muted-foreground">
                Losses from improper position sizing: <span className="font-medium text-red-500">$420</span>.
                Stick to 1-2% risk per trade maximum to protect your capital.
              </p>
              <div className="mt-2 flex gap-1 flex-wrap">
                <Badge variant="outline" className="bg-amber-100">position size</Badge>
                <Badge variant="outline" className="bg-amber-100">risk management</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-green-50">
              <div className="text-sm font-medium mb-2">Trading Plan Adherence</div>
              <p className="text-sm text-muted-foreground">
                When following your trading plan, your win rate increases by <span className="font-medium text-green-500">23%</span>.
                Continue documenting and following your plans.
              </p>
              <div className="mt-2 flex gap-1 flex-wrap">
                <Badge variant="outline" className="bg-green-100">game plan</Badge>
                <Badge variant="outline" className="bg-green-100">followed rules</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartTab;
