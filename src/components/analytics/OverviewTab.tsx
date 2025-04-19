
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { usePlData } from '@/hooks/usePlData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import TradeStatsCard from './TradeStatsCard';
import RunningPLChart from './RunningPLChart';

const OverviewTab: React.FC = () => {
  const stats = useAnalyticsStats();
  const { dailyPL } = usePlData();
  
  // Process data for display
  const positiveTradePercent = stats.allTimeStats.totalTrades > 0 
    ? Math.round((stats.allTimeStats.winningTrades / stats.allTimeStats.totalTrades) * 100) 
    : 0;
  
  const negativeTradePercent = stats.allTimeStats.totalTrades > 0 
    ? Math.round((stats.allTimeStats.losingTrades / stats.allTimeStats.totalTrades) * 100) 
    : 0;

  // Prepare data for RunningPLChart
  const chartData = dailyPL.map(point => ({
    ...point,
    time: point.date,
    value: point.profit
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TradeStatsCard 
          title="Total Trades" 
          value={stats.allTimeStats.totalTrades} 
        />
        <TradeStatsCard 
          title="Winning Trades" 
          value={stats.allTimeStats.winningTrades} 
          percentage={positiveTradePercent} 
        />
        <TradeStatsCard 
          title="Losing Trades" 
          value={stats.allTimeStats.losingTrades} 
          percentage={negativeTradePercent} 
        />
        <TradeStatsCard 
          title="Break Even Trades" 
          value={stats.allTimeStats.breakEvenTrades} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit</CardTitle>
            <CardDescription>Current month profit and loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyStats.profit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weekly Profit</CardTitle>
            <CardDescription>Last 7 days profit and loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.weeklyStats.profit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Profit/Loss</CardTitle>
          <CardDescription>A chart of your daily trading performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyPL} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="profit" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <RunningPLChart data={chartData} />
    </div>
  );
};

export default OverviewTab;
