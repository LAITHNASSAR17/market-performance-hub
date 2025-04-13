
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, DollarSign, Percent, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradingStatsProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  colorClass?: string;
  description?: string;
}

export const TradingStats: React.FC<TradingStatsProps> = ({
  title,
  value,
  trend,
  icon,
  colorClass = 'text-blue-500',
  description
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            
            <div className="flex items-baseline space-x-2">
              <h3 className={cn("text-2xl font-bold", colorClass)}>{value}</h3>
              
              {trend && (
                <div className={cn(
                  "text-sm font-medium flex items-center",
                  trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-500' : 
                  trend.direction === 'down' ? 'text-red-600 dark:text-red-500' : 
                  'text-gray-500 dark:text-gray-400'
                )}>
                  {trend.direction === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                  {trend.direction === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                  {trend.value}
                </div>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <div className={cn(
            "p-2 rounded-full",
            colorClass === 'text-emerald-600' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
            colorClass === 'text-red-600' ? 'bg-red-100 dark:bg-red-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TotalPLCard: React.FC<{
  value: number;
  tradeCount: number;
}> = ({ value, tradeCount }) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
  
  const colorClass = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  
  return (
    <TradingStats
      title="Total P&L"
      value={formattedValue}
      icon={<DollarSign className={cn("h-5 w-5", colorClass)} />}
      trend={{
        value: value > 0 ? '+' + value.toFixed(2) : value.toFixed(2),
        direction: value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'
      }}
      colorClass={colorClass}
      description={`Trades in total: ${tradeCount}`}
    />
  );
};

export const ProfitFactorCard: React.FC<{
  value: number;
}> = ({ value }) => {
  const formattedValue = value === Infinity ? '∞' : value.toFixed(2);
  const trend = {
    value: value > 1 ? `+${(value - 1).toFixed(2)}` : (value - 1).toFixed(2),
    direction: value > 1 ? 'up' : value < 1 ? 'down' : 'neutral' as 'up' | 'down' | 'neutral'
  };
  
  return (
    <TradingStats
      title="Profit factor"
      value={formattedValue}
      icon={<Activity className="h-5 w-5 text-blue-500" />}
      trend={trend}
      description={value > 1 ? 'Good profit to loss ratio' : 'Needs improvement'}
    />
  );
};

export const WinRateCard: React.FC<{
  winRate: number;
  winningTrades: number;
  totalTrades: number;
}> = ({ winRate, winningTrades, totalTrades }) => {
  return (
    <TradingStats
      title="Win Rate"
      value={`${winRate.toFixed(1)}%`}
      icon={<Percent className="h-5 w-5 text-blue-500" />}
      description={`${winningTrades} out of ${totalTrades} trades`}
    />
  );
};

export const AverageTradeCards: React.FC<{
  avgWin: number;
  avgLoss: number;
  winCount: number;
  lossCount: number;
}> = ({ avgWin, avgLoss, winCount, lossCount }) => {
  const formattedWin = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(avgWin);
  
  const formattedLoss = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(avgLoss);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <TradingStats
        title="Average winning trade"
        value={formattedWin}
        icon={<ArrowUp className="h-5 w-5 text-emerald-600" />}
        colorClass="text-emerald-600"
        description={`${winCount} winning trades`}
      />
      
      <TradingStats
        title="Average losing trade"
        value={formattedLoss}
        icon={<ArrowDown className="h-5 w-5 text-red-600" />}
        colorClass="text-red-600"
        description={`${lossCount} losing trades`}
      />
    </div>
  );
};
