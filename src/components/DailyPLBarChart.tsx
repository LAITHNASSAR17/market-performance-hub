
import React from 'react';
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
  
  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 10,
        }}
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="day" 
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={formatYAxis}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
          labelFormatter={(label) => `Day: ${label}`}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        />
        <ReferenceLine y={0} stroke="#ddd" />
        <Bar 
          dataKey="profit" 
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarFill(entry.profit)} 
              fillOpacity={0.85} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyPLBarChart;
