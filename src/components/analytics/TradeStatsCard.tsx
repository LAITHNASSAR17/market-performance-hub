
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface TradeStatsCardProps {
  title: string;
  value: number;
  percentage?: number;
}

export const TradeStatsCard: React.FC<TradeStatsCardProps> = ({ 
  title, 
  value, 
  percentage 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {percentage !== undefined && (
          <div className="mt-2 text-sm font-medium">
            {percentage}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeStatsCard;
