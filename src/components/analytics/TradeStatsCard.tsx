
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/contexts/LanguageContext';

interface TradeStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  type?: 'profit' | 'loss' | 'neutral';
  icon?: React.ReactNode;
  additionalStats?: {
    label: string;
    value: string | number;
  }[];
  className?: string;
}

const TradeStatsCard: React.FC<TradeStatsCardProps> = ({
  title,
  value,
  description,
  type = 'neutral',
  icon,
  additionalStats,
  className
}) => {
  const { t } = useLanguage();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          type === 'profit' ? 'text-green-500' : 
          type === 'loss' ? 'text-red-500' : ''
        }`}>
          {value}
        </div>
        
        {additionalStats && (
          <div className="mt-2 grid gap-1">
            {additionalStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{stat.label}</span>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeStatsCard;
