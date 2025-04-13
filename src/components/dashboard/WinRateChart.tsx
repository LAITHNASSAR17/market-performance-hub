
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WinRateChartProps {
  winRate: number;
  winCount: number;
  lossCount: number;
  title?: string;
}

export const WinRateChart: React.FC<WinRateChartProps> = ({
  winRate,
  winCount,
  lossCount,
  title = "Winning % By Trades"
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {title}
            <CircleIcon className="h-4 w-4 ml-2 text-gray-400" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] flex flex-col sm:flex-row items-center justify-center">
          <div className="relative w-[180px] sm:w-[220px] h-[180px] sm:h-[220px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-500">{winRate.toFixed(0)}%</span>
              <span className="text-sm text-gray-500">winrate</span>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f1f1f1"
                strokeWidth="15"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#36B37E"
                strokeWidth="15"
                strokeDasharray={`${winRate * 2.512} ${(100 - winRate) * 2.512}`}
                strokeDashoffset="0"
                transform="rotate(-90, 50, 50)"
              />
            </svg>
          </div>
          <div className="ml-0 mt-4 sm:mt-0 sm:ml-4">
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                <span className="text-sm">{winCount} winners</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-sm">{lossCount} losers</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinRateChart;
