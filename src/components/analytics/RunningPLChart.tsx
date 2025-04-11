
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface PLDataPoint {
  time: string;
  value: number;
}

interface RunningPLChartProps {
  data: PLDataPoint[];
  title?: string;
}

const RunningPLChart: React.FC<RunningPLChartProps> = ({ data, title = "Running P&L" }) => {
  const { t } = useLanguage();
  
  const formatYAxis = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  // Find min and max values for better chart display
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));
  const domain = [-Math.ceil(absMax * 1.1), Math.ceil(absMax * 1.1)];
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                domain={domain}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border p-2 rounded-md shadow-md text-sm">
                        <p className="text-foreground">{`Time: ${data.time}`}</p>
                        <p className={data.value >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {`P&L: $${data.value.toFixed(2)}`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                fill="url(#colorProfit)"
                fillOpacity={1}
                strokeWidth={2}
                activeDot={{ r: 8 }}
                isAnimationActive={true}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ef4444" 
                fill="url(#colorLoss)"
                fillOpacity={1}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RunningPLChart;
