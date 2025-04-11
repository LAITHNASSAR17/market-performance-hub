import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import StatCard from '@/components/StatCard';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Activity, Percent, Calendar, CircleIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area,
  PieChart as RechartPieChart, 
  Pie,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  BarChart as RechartBarChart,
  Bar
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = ['#36B37E', '#FF5630', '#6554C0', '#FFAB00', '#00B8D9', '#6B778C'];

const Dashboard: React.FC = () => {
  const { trades } = useTrade();
  const { user } = useAuth();
  const [timeframeFilter, setTimeframeFilter] = useState('all');

  const userTrades = user ? trades.filter(trade => trade.userId === user.id) : [];

  const totalTrades = userTrades.length;
  const totalProfit = userTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = userTrades.filter(trade => trade.profitLoss > 0).length;
  const losingTrades = userTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const bestTrade = userTrades.length > 0 ? userTrades.reduce(
    (best, trade) => (trade.profitLoss > best.profitLoss ? trade : best),
    userTrades[0]
  ) : null;
  
  const worstTrade = userTrades.length > 0 ? userTrades.reduce(
    (worst, trade) => (trade.profitLoss < worst.profitLoss ? trade : worst),
    userTrades[0]
  ) : null;

  const winningTradesData = userTrades.filter(trade => trade.profitLoss > 0);
  const avgWinningTrade = winningTradesData.length > 0 
    ? winningTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0) / winningTradesData.length
    : 0;

  const losingTradesData = userTrades.filter(trade => trade.profitLoss < 0);
  const avgLosingTrade = losingTradesData.length > 0 
    ? losingTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0) / losingTradesData.length
    : 0;

  const grossProfit = winningTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const grossLoss = Math.abs(losingTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toISOString().slice(0, 10),
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return result;
  };

  const dailyPerformanceData = getLast7Days().map(dayInfo => {
    const dayTrades = filteredTrades.filter(trade => trade.date === dayInfo.date);
    const dayProfit = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    
    return {
      day: dayInfo.label,
      profit: dayProfit,
      date: dayInfo.date
    };
  });

  const cumulativeProfitData = () => {
    const sorted = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulative = 0;
    return sorted.map(trade => {
      cumulative += trade.profitLoss;
      return {
        date: trade.date,
        value: cumulative
      };
    });
  };

  const winRateData = [
    { name: 'Winning', value: winningTrades, color: '#36B37E' },
    { name: 'Losing', value: losingTrades, color: '#FF5630' }
  ];

  const getMonthlyPerformanceData = () => {
    const monthMap = new Map();
    
    trades.forEach(trade => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          profit: 0,
          trades: 0
        });
      }
      
      const monthData = monthMap.get(monthKey);
      monthData.profit += trade.profitLoss;
      monthData.trades += 1;
    });
    
    return Array.from(monthMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return new Date(0, a.month, 0).getMonth() - new Date(0, b.month, 0).getMonth();
      })
      .map(item => ({
        name: `${item.month} ${item.year}`,
        profit: item.profit,
        trades: item.trades
      }));
  };

  const getCalendarData = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().slice(0, 10);
      const dayTrades = trades.filter(trade => trade.date === dateString);
      
      calendarDays.push({
        day,
        date: dateString,
        trades: dayTrades.length,
        profit: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
      });
    }
    
    return calendarDays;
  };

  const filteredTrades = (() => {
    if (timeframeFilter === 'all') return userTrades;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeframeFilter === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeframeFilter === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeframeFilter === 'quarter') {
      cutoffDate.setDate(now.getDate() - 90);
    } else if (timeframeFilter === 'year') {
      cutoffDate.setDate(now.getDate() - 365);
    }
    
    return userTrades.filter(trade => new Date(trade.date) >= cutoffDate);
  })();

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Trading Dashboard</h1>
          <p className="text-gray-500">Overview of your trading performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total P&L"
          value={`$${totalProfit.toFixed(2)}`}
          trend={totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'neutral'}
          icon={<DollarSign className="h-5 w-5" />}
          color={totalProfit > 0 ? 'green' : totalProfit < 0 ? 'red' : 'default'}
          description={`Trades in total: ${totalTrades}`}
        />
        <StatCard
          title="Profit factor"
          value={profitFactor.toFixed(2)}
          icon={<Activity className="h-5 w-5" />}
          description={`${profitFactor > 1 ? '+' : ''}${(profitFactor - 1).toFixed(2)}`}
        />
        <StatCard
          title="Average winning trade"
          value={`$${avgWinningTrade.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
          description={winningTradesData.length > 0 ? `${winningTradesData.length} winning trades` : 'No winning trades yet'}
        />
        <StatCard
          title="Average losing trade"
          value={`$${Math.abs(avgLosingTrade).toFixed(2)}`}
          icon={<TrendingDown className="h-5 w-5" />}
          color="red"
          description={losingTradesData.length > 0 ? `${losingTradesData.length} losing trades` : 'No losing trades yet'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                Winning % By Trades
                <CircleIcon className="h-4 w-4 ml-2 text-gray-400" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="relative w-[220px] h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={winRateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {winRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-emerald-500">{winRate.toFixed(0)}%</span>
                  <span className="text-sm text-gray-500">winrate</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                    <span className="text-sm">{winningTrades} winners</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-sm">{losingTrades} losers</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <Tabs defaultValue="daily">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">P&L Analysis</CardTitle>
                <TabsList>
                  <TabsTrigger value="daily">Daily Net</TabsTrigger>
                  <TabsTrigger value="cumulative">Net cumulative</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="daily" className="mt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#36B37E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#36B37E" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5630" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF5630" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit/Loss']}
                        labelFormatter={(label) => `Day: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#36B37E"
                        fillOpacity={1}
                        fill="url(#colorProfit)"
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="cumulative" className="mt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeProfitData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cumulative P&L']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#36B37E"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                Winning % By Days
                <CircleIcon className="h-4 w-4 ml-2 text-gray-400" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="relative w-[220px] h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={winRateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {winRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-emerald-500">{winRate.toFixed(0)}%</span>
                  <span className="text-sm text-gray-500">winrate</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                    <span className="text-sm">{winningTrades} winners</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-sm">{losingTrades} losers</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent trades</CardTitle>
              <Button variant="outline" size="sm">Open positions</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Pair</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Volume</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.slice(0, 5).map((trade) => (
                    <tr key={trade.id} className="border-b">
                      <td className="px-3 py-2">{trade.date}</td>
                      <td className="px-3 py-2">{trade.pair}</td>
                      <td className="px-3 py-2">{trade.lotSize}</td>
                      <td className={cn(
                        "px-3 py-2 font-medium",
                        trade.profitLoss > 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">June 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            <div className="text-sm font-medium text-center p-2">Sun</div>
            <div className="text-sm font-medium text-center p-2">Mon</div>
            <div className="text-sm font-medium text-center p-2">Tue</div>
            <div className="text-sm font-medium text-center p-2">Wed</div>
            <div className="text-sm font-medium text-center p-2">Thu</div>
            <div className="text-sm font-medium text-center p-2">Fri</div>
            <div className="text-sm font-medium text-center p-2">Sat</div>
            
            {getCalendarData().map((day, index) => 
              day === null ? (
                <div key={`empty-${index}`} className="p-2"></div>
              ) : (
                <div 
                  key={`day-${day.day}`} 
                  className={cn(
                    "border rounded p-2 text-center min-h-[80px]",
                    day.profit > 0 ? "bg-green-50 border-green-200" : 
                    day.profit < 0 ? "bg-red-50 border-red-200" : 
                    "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="text-sm">{day.day}</div>
                  {day.trades > 0 && (
                    <>
                      <div className={cn(
                        "text-lg font-bold mt-1",
                        day.profit > 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {day.profit > 0 ? '+' : ''}{day.profit.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">{day.trades} {day.trades === 1 ? 'trade' : 'trades'}</div>
                    </>
                  )}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Dashboard;
