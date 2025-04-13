
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CircleIcon, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  color = 'blue',
  trend
}) => {
  const valueColor = typeof value === 'string' && value.startsWith('-') ? 
    'text-red-600 dark:text-red-400' : 
    'text-green-600 dark:text-green-400';
  
  return (
    <Card className="overflow-hidden border-t-4 shadow-sm transition-all hover:shadow-md" 
      style={{ borderTopColor: color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#3b82f6' }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                {icon}
              </span>
            )}
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              {title}
              <CircleIcon className="ml-1 h-3 w-3 text-blue-500" />
            </span>
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-xs",
              trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-gray-500"
            )}>
              {trend === 'up' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
              {description}
            </div>
          )}
        </div>
        <div className={cn("mt-3 text-3xl font-bold", valueColor)}>
          {value}
        </div>
        {!trend && description && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsGridProps {
  stats: {
    totalPL: string;
    winRate: string;
    avgWin: string;
    avgLoss: string;
    profitFactorFormatted: string;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
  };
}

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  const totalPLValue = parseFloat(stats.totalPL.replace('$', ''));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title={t('analytics.netPL') || 'Total Net P&L'}
        value={stats.totalPL}
        description={`${t('analytics.tradesInTotal') || 'Trades in total'}: ${stats.totalTrades}`}
        icon={<DollarSign className="h-4 w-4 text-blue-600" />}
        color={totalPLValue >= 0 ? 'green' : 'red'}
      />
      
      <StatsCard
        title={t('analytics.profitFactor') || 'Profit Factor'}
        value={stats.profitFactorFormatted}
        description={`${parseFloat(stats.profitFactorFormatted) > 1 ? '+' : ''}${(parseFloat(stats.profitFactorFormatted) - 1).toFixed(2)}`}
        icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
        color="blue"
      />
      
      <StatsCard
        title={t('analytics.avgWin') || 'Average Winning Trade'}
        value={stats.avgWin}
        description={`${stats.winningTrades} ${t('analytics.wins') || 'wins'}`}
        icon={<ArrowUpRight className="h-4 w-4 text-green-600" />}
        color="green"
      />
      
      <StatsCard
        title={t('analytics.avgLoss') || 'Average Losing Trade'}
        value={stats.avgLoss}
        description={`${stats.losingTrades} ${t('analytics.losses') || 'losses'}`}
        icon={<ArrowDownRight className="h-4 w-4 text-red-600" />}
        color="red"
      />
    </div>
  );
};

export default DashboardStatsGrid;
