
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}) => {
  return (
    <Card className={cn("h-full overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
              {value}
              {trend && (
                <span 
                  className={cn(
                    "ml-2 text-sm", 
                    trend === 'up' ? 'text-green-500' : 
                    trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  )}
                >
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
                </span>
              )}
            </h3>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          {icon && (
            <div className="p-2 rounded-full bg-blue-50 text-blue-500">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
