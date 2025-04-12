
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
import { Trade } from '@/contexts/TradeContext';
import { format, parseISO } from 'date-fns';

interface DailyPLBarChartProps {
  trades: Trade[];
  title?: string;
  className?: string;
}

const DailyPLBarChart: React.FC<DailyPLBarChartProps> = ({ 
  trades, 
  title = "Net Daily P&L",
  className 
}) => {
  // Process trades to get daily P&L data
  const data = useMemo(() => {
    // Group trades by date
    const tradesByDate = trades.reduce((acc: Record<string, number>, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = 0;
      }
      acc[trade.date] += trade.profitLoss;
      return acc;
    }, {});
    
    // Convert to array format for chart
    return Object.entries(tradesByDate)
      .map(([date, profit]) => {
        let formattedDate;
        try {
          formattedDate = format(parseISO(date), 'MMM dd');
        } catch (e) {
          formattedDate = date; // Fallback to original date string if parsing fails
        }
        
        return {
          day: formattedDate,
          profit,
          date
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Show only the last 14 days
  }, [trades]);
  
  const getBarFill = (profit: number) => {
    return profit >= 0 ? "#36B37E" : "#FF5630";
  };
  
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No trade data available
      </div>
    );
  }
  
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%" className={className}>
        <BarChart
          data={data}
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarFill(entry.profit)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyPLBarChart;
