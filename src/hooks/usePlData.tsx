
import { useState, useEffect } from 'react';
import { useTrade } from '@/contexts/TradeContext';

export interface PLDataPoint {
  date: string;
  profit: number;
  // Add these properties to make it compatible with RunningPLChart
  time?: string;
  value?: number;
}

export const usePlData = () => {
  const { trades } = useTrade();
  const [dailyPL, setDailyPL] = useState<PLDataPoint[]>([]);

  useEffect(() => {
    if (!trades.length) return;

    // Group trades by date and calculate daily P/L
    const dailyData = trades.reduce((acc, trade) => {
      const date = trade.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += trade.profitLoss;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format for chart
    const chartData: PLDataPoint[] = Object.entries(dailyData).map(([date, profit]) => ({
      date,
      profit,
      // Add compatible properties
      time: date,
      value: profit
    }));

    // Sort by date
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setDailyPL(chartData);
  }, [trades]);

  return {
    dailyPL
  };
};

export default usePlData;
