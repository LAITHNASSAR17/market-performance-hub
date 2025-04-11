
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/contexts/TradeContext';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface CumulativePLChartProps {
  trades: Trade[];
  title?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

const CumulativePLChart: React.FC<CumulativePLChartProps> = ({ 
  trades, 
  title = "Daily Net Cumulative P&L",
  timeRange = 'month'
}) => {
  // Group trades by date and calculate daily P&L
  const tradesByDate = trades.reduce((acc: Record<string, number>, trade) => {
    if (!acc[trade.date]) {
      acc[trade.date] = 0;
    }
    acc[trade.date] += trade.profitLoss;
    return acc;
  }, {});
  
  // Generate all dates in the range
  const now = new Date();
  let startDate = now;
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case 'quarter':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case 'all':
      // Find the oldest trade date
      if (trades.length > 0) {
        const dates = trades.map(trade => new Date(trade.date));
        startDate = new Date(Math.min(...dates.map(date => date.getTime())));
      }
      break;
  }
  
  const dateRange = eachDayOfInterval({
    start: startDate,
    end: new Date()
  });
  
  // Create data array with cumulative P&L
  let cumulativeTotal = 0;
  const chartData = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dailyPL = tradesByDate[dateStr] || 0;
    cumulativeTotal += dailyPL;
    
    return {
      date: dateStr,
      dailyPL: dailyPL,
      cumulativePL: cumulativeTotal
    };
  });
  
  const formatTooltipDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36B37E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#36B37E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNegativePL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5630" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF5630" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(dateStr) => format(parseISO(dateStr), 'MM/dd')}
                minTickGap={30}
              />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`} 
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
                labelFormatter={formatTooltipDate}
              />
              <Area 
                type="monotone" 
                dataKey="cumulativePL" 
                stroke="#36B37E" 
                fill="url(#colorPL)"
                activeDot={{ r: 6 }}
                connectNulls
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CumulativePLChart;
