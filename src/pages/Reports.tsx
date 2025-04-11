
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Calendar, Download, DollarSign, Percent, PieChart, LineChart as LineChartIcon, Clock, BarChart as BarChartIcon } from 'lucide-react';
import {
  PieChart,
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
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import StatCard from '@/components/StatCard';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#D06F99', '#6FD0C9'];

const Reports: React.FC = () => {
  const { trades } = useTrade();
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [filterType, setFilterType] = useState('pair');

  // Apply timeframe filter
  const filteredTrades = trades.filter(trade => {
    if (timeframeFilter === 'all') return true;
    
    const tradeDate = new Date(trade.date);
    const now = new Date();
    
    switch (timeframeFilter) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return tradeDate >= weekAgo;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return tradeDate >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date();
        quarterAgo.setMonth(now.getMonth() - 3);
        return tradeDate >= quarterAgo;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return tradeDate >= yearAgo;
      default:
        return true;
    }
  });

  // Calculate summary stats
  const totalTrades = filteredTrades.length;
  const totalProfit = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0).length;
  const losingTrades = filteredTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const bestTrade = filteredTrades.reduce(
    (best, trade) => (trade.profitLoss > best.profitLoss ? trade : best),
    filteredTrades[0] || { profitLoss: 0, pair: 'N/A' }
  );
  
  const worstTrade = filteredTrades.reduce(
    (worst, trade) => (trade.profitLoss < worst.profitLoss ? trade : worst),
    filteredTrades[0] || { profitLoss: 0, pair: 'N/A' }
  );

  const avgProfitPerTrade = totalTrades > 0 ? totalProfit / totalTrades : 0;

  // Prepare data for breakdown charts
  const getBreakdownData = () => {
    switch (filterType) {
      case 'pair': 
        return getPairBreakdown();
      case 'type':
        return getTradeTypeBreakdown();
      case 'account':
        return getAccountBreakdown();
      case 'day':
        return getDayOfWeekBreakdown();
      case 'result':
        return getResultBreakdown();
      default:
        return [];
    }
  };

  const getPairBreakdown = () => {
    const pairMap = new Map<string, { count: number; profit: number }>();
    
    filteredTrades.forEach(trade => {
      if (!pairMap.has(trade.pair)) {
        pairMap.set(trade.pair, { count: 0, profit: 0 });
      }
      
      const pairData = pairMap.get(trade.pair)!;
      pairData.count += 1;
      pairData.profit += trade.profitLoss;
    });
    
    return Array.from(pairMap.entries()).map(([pair, data]) => ({
      name: pair,
      value: data.count,
      profit: data.profit
    }));
  };

  const getTradeTypeBreakdown = () => {
    const buyTrades = filteredTrades.filter(trade => trade.type === 'Buy');
    const sellTrades = filteredTrades.filter(trade => trade.type === 'Sell');
    
    const buyProfit = buyTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const sellProfit = sellTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    
    return [
      { name: 'Buy', value: buyTrades.length, profit: buyProfit },
      { name: 'Sell', value: sellTrades.length, profit: sellProfit }
    ];
  };

  const getAccountBreakdown = () => {
    const accountMap = new Map<string, { count: number; profit: number }>();
    
    filteredTrades.forEach(trade => {
      if (!accountMap.has(trade.account)) {
        accountMap.set(trade.account, { count: 0, profit: 0 });
      }
      
      const accountData = accountMap.get(trade.account)!;
      accountData.count += 1;
      accountData.profit += trade.profitLoss;
    });
    
    return Array.from(accountMap.entries()).map(([account, data]) => ({
      name: account,
      value: data.count,
      profit: data.profit
    }));
  };

  const getDayOfWeekBreakdown = () => {
    const dayMap = new Map<number, { name: string; count: number; profit: number }>();
    
    // Initialize map with all days of the week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayNames.forEach((name, index) => {
      dayMap.set(index, { name, count: 0, profit: 0 });
    });
    
    filteredTrades.forEach(trade => {
      const date = new Date(trade.date);
      const dayOfWeek = date.getDay();
      
      const dayData = dayMap.get(dayOfWeek)!;
      dayData.count += 1;
      dayData.profit += trade.profitLoss;
    });
    
    return Array.from(dayMap.values()).map(data => ({
      name: data.name,
      value: data.count,
      profit: data.profit
    }));
  };

  const getResultBreakdown = () => {
    const winCount = winningTrades;
    const lossCount = losingTrades;
    const breakEvenCount = totalTrades - winCount - lossCount;
    
    const winProfit = filteredTrades
      .filter(trade => trade.profitLoss > 0)
      .reduce((sum, trade) => sum + trade.profitLoss, 0);
      
    const lossProfit = filteredTrades
      .filter(trade => trade.profitLoss < 0)
      .reduce((sum, trade) => sum + trade.profitLoss, 0);
      
    const breakEvenProfit = filteredTrades
      .filter(trade => trade.profitLoss === 0)
      .reduce((sum, trade) => sum + trade.profitLoss, 0);
    
    return [
      { name: 'Win', value: winCount, profit: winProfit },
      { name: 'Loss', value: lossCount, profit: lossProfit },
      { name: 'Break Even', value: breakEvenCount, profit: breakEvenProfit }
    ];
  };

  // Prepare monthly performance data
  const getMonthlyPerformanceData = () => {
    // Get last 6 months
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: month.toLocaleString('default', { month: 'short' }),
        year: month.getFullYear(),
        monthNum: month.getMonth()
      });
    }
    
    return months.map(({ month, year, monthNum }) => {
      const monthTrades = filteredTrades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate.getMonth() === monthNum && tradeDate.getFullYear() === year;
      });
      
      const monthProfit = monthTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const tradeCount = monthTrades.length;
      
      return {
        name: `${month}`,
        profit: monthProfit,
        trades: tradeCount
      };
    });
  };

  // Prepare data for bar chart by day
  const getProfitByDayData = () => {
    const dayMap = new Map<string, { profit: number; trades: number }>();
    
    // Get last 7 days
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayString = day.toISOString().split('T')[0];
      days.push(dayString);
      dayMap.set(dayString, { profit: 0, trades: 0 });
    }
    
    filteredTrades.forEach(trade => {
      if (dayMap.has(trade.date)) {
        const dayData = dayMap.get(trade.date)!;
        dayData.profit += trade.profitLoss;
        dayData.trades += 1;
      }
    });
    
    return days.map(day => {
      const data = dayMap.get(day) || { profit: 0, trades: 0 };
      return {
        name: new Date(day).toLocaleString('default', { weekday: 'short' }),
        profit: data.profit,
        trades: data.trades
      };
    });
  };

  const exportCsv = () => {
    if (filteredTrades.length === 0) return;
    
    const headers = [
      'Date', 
      'Account', 
      'Pair', 
      'Type', 
      'Entry', 
      'Exit', 
      'Lot Size', 
      'P/L', 
      'Duration', 
      'Hashtags'
    ].join(',');
    
    const rows = filteredTrades.map(trade => [
      trade.date,
      trade.account,
      trade.pair,
      trade.type,
      trade.entry,
      trade.exit,
      trade.lotSize,
      trade.profitLoss,
      trade.durationMinutes,
      trade.hashtags.join(' ')
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create file and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trade_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Performance Reports</h1>
          <p className="text-gray-500">Detailed breakdown of your trading results</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Profit/Loss"
          value={`$${totalProfit.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'neutral'}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          description={`${winningTrades}/${totalTrades} trades`}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          title="Best Trade"
          value={`$${bestTrade.profitLoss?.toFixed(2) || '0.00'}`}
          description={bestTrade.pair}
          icon={<LineChartIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Average Profit"
          value={`$${avgProfitPerTrade.toFixed(2)}`}
          description="Per trade"
          icon={<BarChartIcon className="h-5 w-5" />}
        />
      </div>

      {/* Monthly Performance Chart */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <LineChartIcon className="h-5 w-5 mr-2" />
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getMonthlyPerformanceData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit/Loss']} />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Profit/Loss"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profit by Day and Breakdown Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profit by Day Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChartIcon className="h-5 w-5 mr-2" />
              Profit by Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartBarChart
                  data={getProfitByDayData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'profit' ? `$${Number(value).toFixed(2)}` : value,
                    name === 'profit' ? 'Profit/Loss' : 'Trades'
                  ]} />
                  <Bar dataKey="profit" fill="#3b82f6" name="Profit/Loss" />
                </RechartBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Trading Breakdown
              </CardTitle>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pair">By Pair</SelectItem>
                  <SelectItem value="type">By Type</SelectItem>
                  <SelectItem value="account">By Account</SelectItem>
                  <SelectItem value="day">By Day of Week</SelectItem>
                  <SelectItem value="result">By Result</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getBreakdownData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getBreakdownData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} trades ($${props.payload.profit.toFixed(2)})`,
                      props.payload.name
                    ]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Detailed Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <div className="py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Trades</p>
                <p className="text-xl font-bold mt-1">{totalTrades}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Winning Trades</p>
                <p className="text-xl font-bold mt-1 text-profit">{winningTrades}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Losing Trades</p>
                <p className="text-xl font-bold mt-1 text-loss">{losingTrades}</p>
              </div>
            </div>
            
            <div className="py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Win Rate</p>
                <p className="text-xl font-bold mt-1">{winRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Best Trade</p>
                <p className="text-xl font-bold mt-1 text-profit">
                  ${bestTrade.profitLoss?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500">{bestTrade.pair}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Worst Trade</p>
                <p className="text-xl font-bold mt-1 text-loss">
                  ${worstTrade.profitLoss?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500">{worstTrade.pair}</p>
              </div>
            </div>
            
            <div className="py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Profit/Loss</p>
                <p className={cn(
                  "text-xl font-bold mt-1",
                  avgProfitPerTrade > 0 ? "text-profit" : avgProfitPerTrade < 0 ? "text-loss" : ""
                )}>
                  ${avgProfitPerTrade.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Per trade</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Most Traded Pair</p>
                {getPairBreakdown().length > 0 ? (
                  <>
                    <p className="text-xl font-bold mt-1">{getPairBreakdown()[0].name}</p>
                    <p className="text-xs text-gray-500">{getPairBreakdown()[0].value} trades</p>
                  </>
                ) : (
                  <p className="text-xl font-bold mt-1">N/A</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Most Profitable Pair</p>
                {getPairBreakdown().length > 0 ? (
                  <>
                    <p className="text-xl font-bold mt-1">
                      {getPairBreakdown().sort((a, b) => b.profit - a.profit)[0].name}
                    </p>
                    <p className={cn(
                      "text-xs",
                      getPairBreakdown().sort((a, b) => b.profit - a.profit)[0].profit > 0 
                        ? "text-profit" 
                        : "text-loss"
                    )}>
                      ${getPairBreakdown().sort((a, b) => b.profit - a.profit)[0].profit.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-bold mt-1">N/A</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Reports;
