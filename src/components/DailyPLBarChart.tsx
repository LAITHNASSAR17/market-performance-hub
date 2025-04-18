
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/types/trade';

interface DailyPLDataPoint {
  day: string;
  profit: number;
  date: string;
}

interface DailyPLBarChartProps {
  data?: DailyPLDataPoint[];
  trades?: Trade[];
  title?: string;
  className?: string;
}

const DailyPLBarChart: React.FC<DailyPLBarChartProps> = ({ 
  data,
  trades = [],
  title = "Net Daily P&L",
  className 
}) => {
  // Calculate chart data from trades if trades are provided and data is not
  const chartData = useMemo(() => {
    // If data is directly provided, use it
    if (data && data.length > 0) {
      return data;
    }
    
    // If trades are provided, calculate the data
    if (trades && trades.length > 0) {
      // Group trades by date
      const tradesByDate = trades.reduce((acc: Record<string, Trade[]>, trade) => {
        if (!acc[trade.date]) {
          acc[trade.date] = [];
        }
        acc[trade.date].push(trade);
        return acc;
      }, {});
      
      // Calculate profit for each day
      return Object.entries(tradesByDate).map(([date, dailyTrades]) => {
        const dailyProfit = dailyTrades.reduce((sum, trade) => sum + trade.total, 0);
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        
        return {
          day: dayName,
          profit: dailyProfit,
          date: date
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    // Default empty array if neither data nor trades are provided
    return [];
  }, [data, trades]);
  
  const getBarFill = (profit: number) => {
    return profit >= 0 ? "#36B37E" : "#FF5630";
  };
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" />
        <YAxis 
          tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} 
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
          labelFormatter={(label) => `Day: ${label}`}
          cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
        />
        <ReferenceLine y={0} stroke="#666" />
        <Bar 
          dataKey="profit" 
          fill="#36B37E" 
          radius={[4, 4, 0, 0]}
          fillOpacity={0.8}
          isAnimationActive={true}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarFill(entry.profit)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyPLBarChart;
