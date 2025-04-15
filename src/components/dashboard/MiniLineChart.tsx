
import React from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface MiniLineChartProps {
  data: any[];
  dataKey: string;
  stroke?: string;
  fill?: string;
  type?: 'line' | 'area';
  height?: number;
  width?: number;
}

const MiniLineChart: React.FC<MiniLineChartProps> = ({
  data,
  dataKey,
  stroke = "#3b82f6",
  fill = "rgba(59, 130, 246, 0.2)",
  type = 'line',
  height = 40,
  width = 100
}) => {
  if (type === 'area') {
    return (
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={stroke} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={stroke} 
            fill="url(#colorGradient)" 
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MiniLineChart;
