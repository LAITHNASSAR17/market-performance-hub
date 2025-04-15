
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  trendClassName?: string;
  chartComponent?: React.ReactNode;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  iconClassName,
  valueClassName,
  trendClassName,
  chartComponent
}) => {
  return (
    <DashboardCard className={className}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
          {icon && (
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600",
              iconClassName
            )}>
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className={cn("text-2xl font-semibold", valueClassName)}>
              {value}
            </span>
            {trend && (
              <div className={cn(
                "flex items-center text-xs mt-1",
                trend.isPositive ? "text-green-500" : "text-red-500",
                trendClassName
              )}>
                {trend.isPositive ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                <span>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                  {trend.label && <span className="ml-1 text-gray-500">{trend.label}</span>}
                </span>
              </div>
            )}
          </div>
          {chartComponent && (
            <div className="h-12">
              {chartComponent}
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

export default StatisticCard;
