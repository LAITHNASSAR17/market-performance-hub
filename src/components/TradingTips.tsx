
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Zap, BarChart2 } from 'lucide-react';

const TradingTips: React.FC = () => {
  const tips = [
    {
      icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
      title: 'Follow the Trend',
      description: 'In trending markets, position yourself in the direction of the trend.'
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      title: 'Risk Management',
      description: 'Never risk more than 1-2% of your capital on a single trade.'
    },
    {
      icon: <Zap className="h-4 w-4 text-purple-500" />,
      title: 'Emotional Control',
      description: 'Keep emotions in check. Stick to your trading plan.'
    },
    {
      icon: <BarChart2 className="h-4 w-4 text-green-500" />,
      title: 'Track Your Trades',
      description: 'Keep a detailed record of all trades to identify patterns.'
    }
  ];

  return (
    <div className="space-y-3">
      {tips.map((tip, index) => (
        <Card key={index} className="bg-card hover:shadow transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{tip.icon}</div>
              <div>
                <h4 className="font-medium text-sm">{tip.title}</h4>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TradingTips;
