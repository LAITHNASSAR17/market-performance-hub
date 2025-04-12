
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyPLBarChartProps {
  data: Array<{
    day: string;
    profit: number;
    date: string;
  }>;
  title?: string;
  className?: string;
}

const DailyPLBarChart: React.FC<DailyPLBarChartProps> = ({ 
  data, 
  title = "Net Daily P&L",
  className 
}) => {
  const getBarFill = (profit: number) => {
    return profit >= 0 ? "#36B37E" : "#FF5630";
  };
  
  return (
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
            <Bar key={`bar-${index}`} fill={getBarFill(entry.profit)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyPLBarChart;
