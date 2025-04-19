import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { usePlData } from '@/hooks/usePlData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { TradeStatsCard } from './TradeStatsCard';
import RunningPLChart from './RunningPLChart';

// Helper to ensure profit is a number for chart data
const ensureNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  return 0;
};

const OverviewTab: React.FC = () => {
  const { allTimeStats, monthlyStats, weeklyStats } = useAnalyticsStats();
  const plData = usePlData();
  
  // Ensure profit values are numbers
  const processedData = plData.dailyPL.map(item => ({
    ...item,
    profit: ensureNumber(item.profit)
  }));
  
  // Process data for display
  const positiveTradePercent = allTimeStats.totalTrades > 0 
    ? Math.round((allTimeStats.winningTrades / allTimeStats.totalTrades) * 100) 
    : 0;
  
  const negativeTradePercent = allTimeStats.totalTrades > 0 
    ? Math.round((allTimeStats.losingTrades / allTimeStats.totalTrades) * 100) 
    : 0;
    
  // Calculate monthly profit/loss
  const monthlyProfit = processedData
    .filter(day => {
      const dayDate = new Date(day.date);
      const today = new Date();
      return dayDate.getMonth() === today.getMonth() && 
             dayDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, day) => sum + day.profit, 0);
  
  // Calculate weekly profit/loss  
  const weeklyProfit = processedData
    .filter(day => {
      const dayDate = new Date(day.date);
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return dayDate >= lastWeek && dayDate <= today;
    })
    .reduce((sum, day) => sum + day.profit, 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TradeStatsCard title="Total Trades" value={allTimeStats.totalTrades} />
        <TradeStatsCard title="Winning Trades" value={allTimeStats.winningTrades} percentage={positiveTradePercent} />
        <TradeStatsCard title="Losing Trades" value={allTimeStats.losingTrades} percentage={negativeTradePercent} />
        <TradeStatsCard title="Break Even Trades" value={allTimeStats.breakEvenTrades} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit</CardTitle>
            <CardDescription>Current month profit and loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weekly Profit</CardTitle>
            <CardDescription>Last 7 days profit and loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${weeklyProfit.toFixed(2)}</div>
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
            <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="profit" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <RunningPLChart />
    </div>
  );
};

export default OverviewTab;
