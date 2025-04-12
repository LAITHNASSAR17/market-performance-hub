
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  color?: 'default' | 'green' | 'red' | 'purple' | 'blue';
  onClick?: () => void;
  actionUrl?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  color = 'default',
  onClick,
  actionUrl
}) => {
  const isMobile = useIsMobile();
  
  const content = (
    <CardContent className="p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <h3 className={cn(
            "text-xl md:text-2xl font-bold mt-1 truncate",
            color === 'green' && "text-emerald-500",
            color === 'red' && "text-red-500",
            color === 'purple' && "text-purple-500",
            color === 'blue' && "text-blue-500"
          )}>
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
          {description && (
            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{description}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-2 rounded-full flex-shrink-0 ml-2",
            color === 'default' && "bg-blue-50 text-blue-500",
            color === 'green' && "bg-emerald-50 text-emerald-500",
            color === 'red' && "bg-red-50 text-red-500",
            color === 'purple' && "bg-purple-50 text-purple-500",
            color === 'blue' && "bg-blue-50 text-blue-500",
          )}>
            {icon}
          </div>
        )}
      </div>
    </CardContent>
  );
  
  if (actionUrl) {
    return (
      <Card 
        className={cn(
          "h-full overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md", 
          className
        )}
      >
        <Link to={actionUrl}>
          {content}
        </Link>
      </Card>
    );
  }
  
  return (
    <Card 
      className={cn(
        "h-full overflow-hidden transition-all duration-200", 
        onClick && "cursor-pointer hover:shadow-md", 
        className
      )}
      onClick={onClick}
    >
      {content}
    </Card>
  );
};

export default StatCard;
