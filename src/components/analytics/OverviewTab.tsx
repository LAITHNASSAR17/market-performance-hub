
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { LineChart, BarChart } from 'lucide-react';
import TradeStatsCard from './TradeStatsCard';
import DailyPLBarChart from '../DailyPLBarChart';
import CumulativePLChart from '../CumulativePLChart';
import { useTrade } from '@/contexts/TradeContext';
import { format, subDays } from 'date-fns';

const OverviewTab = () => {
  const stats = useAnalyticsStats();
  const { trades } = useTrade();
  
  // Calculate daily P&L data for the last 30 days
  const getDailyData = () => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const filtered = trades.filter(trade => new Date(trade.date) >= thirtyDaysAgo);
    
    const dailyPL = filtered.reduce((acc: Record<string, number>, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = 0;
      }
      acc[trade.date] += trade.total;
      return acc;
    }, {});

    return Object.entries(dailyPL).map(([date, profit]) => ({
      day: format(new Date(date), 'MMM dd'),
      profit,
      date
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <TradeStatsCard
          title="Total P&L"
          value={stats.totalPL}
          icon={LineChart}
          description="Net profit/loss after fees"
          className={Number(stats.totalPL.replace('$', '')) >= 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}
        />
        
        <TradeStatsCard
          title="Win Rate"
          value={stats.winRate}
          icon={BarChart}
          description={`${stats.winningTrades} wins, ${stats.losingTrades} losses`}
        />
        
        <TradeStatsCard
          title="Profit Factor"
          value={stats.profitFactor}
          icon={LineChart}
          description="Gross profit / Gross loss"
        />
        
        <TradeStatsCard
          title="Avg Trade"
          value={Number(stats.avgWin.replace('$', '')) >= 0 ? stats.avgWin : stats.avgLoss}
          icon={BarChart}
          description="Average trade P&L"
          className={Number(stats.avgWin.replace('$', '')) >= 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily P&L</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <DailyPLBarChart data={getDailyData()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative P&L</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <CumulativePLChart trades={trades} timeRange="month" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
