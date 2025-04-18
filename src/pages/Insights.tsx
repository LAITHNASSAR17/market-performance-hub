
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, BarChart, Clock, Percent as PercentIcon, LineChart, Target, Lightbulb, Brain } from 'lucide-react';
import StatCard from '@/components/StatCard';
import HashtagBadge from '@/components/HashtagBadge';
import { cn } from '@/lib/utils';
import TradingTips from '@/components/TradingTips';
import TradingInsights from '@/components/TradingInsights';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import DailyPLBarChart from '@/components/DailyPLBarChart';
import CumulativePLChart from '@/components/CumulativePLChart';
import AverageTradeCards from '@/components/AverageTradeCards';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';

interface InsightsProps {
  // Define any props here
}

const Insights: React.FC<InsightsProps> = ({ /* props */ }) => {
  const { trades, allHashtags, addHashtag } = useTrade();
  const { language } = useLanguage();
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const stats = useAnalyticsStats();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');

  // Filter trades based on selected hashtags
  const filteredTrades = trades.filter(trade =>
    selectedHashtags.length === 0 || selectedHashtags.every(tag => trade.hashtags.includes(tag))
  );

  // Calculate total profit/loss for filtered trades
  const totalProfitLoss = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const totalFees = filteredTrades.reduce((sum, trade) => sum + trade.commission, 0);
  const netProfitLoss = totalProfitLoss - totalFees;

  // Calculate win rate for filtered trades
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0).length;
  const losingTrades = filteredTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Calculate average trade duration
  const tradesWithDuration = filteredTrades.filter(trade => trade.durationMinutes !== null && trade.durationMinutes > 0);
  const avgDuration = tradesWithDuration.length > 0 
    ? tradesWithDuration.reduce((sum, trade) => sum + (trade.durationMinutes || 0), 0) / tradesWithDuration.length 
    : 0;
  
  // Format average duration
  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Calculate average win and loss amounts
  const winningTradesList = filteredTrades.filter(trade => trade.profitLoss > 0);
  const losingTradesList = filteredTrades.filter(trade => trade.profitLoss < 0);
  
  const avgWin = winningTradesList.length > 0 
    ? winningTradesList.reduce((sum, trade) => sum + trade.profitLoss, 0) / winningTradesList.length 
    : 0;
    
  const avgLoss = losingTradesList.length > 0 
    ? Math.abs(losingTradesList.reduce((sum, trade) => sum + trade.profitLoss, 0) / losingTradesList.length)
    : 0;
  
  // Prepare data for daily PL chart
  const prepareDailyPLData = () => {
    // Get date range based on selected timeRange
    let startDate = new Date();
    const endDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subDays(endDate, 30);
        break;
      case 'quarter':
        startDate = subDays(endDate, 90);
        break;
      case 'year':
        startDate = subDays(endDate, 365);
        break;
      case 'all':
        if (filteredTrades.length > 0) {
          const dates = filteredTrades.map(trade => new Date(trade.date));
          startDate = new Date(Math.min(...dates.map(date => date.getTime())));
        } else {
          startDate = subDays(endDate, 30); // Default to month if no trades
        }
        break;
    }
    
    // Create date range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Group trades by date
    const tradesByDate = filteredTrades.reduce((acc: Record<string, number>, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = 0;
      }
      acc[trade.date] += trade.total;
      return acc;
    }, {});
    
    // Create data for chart
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        day: format(date, 'MM/dd'),
        date: dateStr,
        profit: tradesByDate[dateStr] || 0
      };
    });
  };
  
  const dailyPLData = prepareDailyPLData();

  // Handler for selecting/deselecting a hashtag
  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Handler for adding a new hashtag
  const handleAddHashtag = () => {
    if (newHashtag.trim() !== '') {
      addHashtag(newHashtag.trim());
      setSelectedHashtags(prev => [...prev, newHashtag.trim()]);
      setNewHashtag('');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-4 md:py-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">تحليل التداول</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="الربح/الخسارة الإجمالية"
            value={`$${netProfitLoss.toFixed(2)}`}
            trend={netProfitLoss > 0 ? 'up' : netProfitLoss < 0 ? 'down' : 'neutral'}
            icon={<DollarSign className="h-5 w-5" />}
            color={netProfitLoss > 0 ? 'green' : netProfitLoss < 0 ? 'red' : 'default'}
            description={`الصفقات: ${totalTrades} | الرسوم: $${totalFees.toFixed(2)}`}
          />
          <StatCard
            title="نسبة الربح"
            value={`${winRate.toFixed(1)}%`}
            description={`${winningTrades}/${totalTrades} صفقة`}
            icon={<PercentIcon className="h-5 w-5" />}
          />
          <StatCard
            title="إجمالي الصفقات"
            value={totalTrades}
            icon={<BarChart className="h-5 w-5" />}
            description={`رابحة:${winningTrades} خاسرة:${losingTrades}`}
          />
          <StatCard
            title="متوسط المدة"
            value={formatDuration(avgDuration)}
            icon={<Clock className="h-5 w-5" />}
            description={`${tradesWithDuration.length} صفقة`}
          />
        </div>

        {/* Hashtag Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">تصفية حسب العلامات</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {allHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleHashtag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                  selectedHashtags.includes(tag)
                    ? "bg-blue-500 text-white dark:bg-indigo-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
          <div className="flex items-center mt-3">
            <Input
              type="text"
              placeholder="إضافة علامة جديدة"
              value={newHashtag}
              onChange={e => setNewHashtag(e.target.value)}
              className="border rounded-l px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Button
              onClick={handleAddHashtag}
              className="bg-green-500 hover:bg-green-600 text-white rounded-r px-3 py-1 text-sm"
            >
              إضافة
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">النطاق الزمني</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                timeRange === 'week'
                  ? "bg-blue-500 text-white dark:bg-indigo-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              )}
            >
              أسبوع
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                timeRange === 'month'
                  ? "bg-blue-500 text-white dark:bg-indigo-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              )}
            >
              شهر
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                timeRange === 'quarter'
                  ? "bg-blue-500 text-white dark:bg-indigo-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              )}
            >
              3 أشهر
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                timeRange === 'year'
                  ? "bg-blue-500 text-white dark:bg-indigo-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              )}
            >
              سنة
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                timeRange === 'all'
                  ? "bg-blue-500 text-white dark:bg-indigo-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              )}
            >
              كل الوقت
            </button>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TradingInsights timeRange={timeRange} />
          <TradingTips />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-[350px]">
            <h2 className="text-xl font-semibold mb-2 dark:text-white">الربح/الخسارة اليومية</h2>
            <DailyPLBarChart data={dailyPLData} className="h-[280px]" />
          </div>
          <div className="h-[350px]">
            <CumulativePLChart trades={filteredTrades} timeRange={timeRange} />
          </div>
        </div>

        {/* Average Trade Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AverageTradeCards 
            avgWin={avgWin} 
            avgLoss={avgLoss}
            winCount={winningTradesList.length}
            lossCount={losingTradesList.length}
          />
          
          {/* Performance Analysis */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                تحليل الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTrades.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">الأداء حسب الزوج</h3>
                    {Object.entries(
                      filteredTrades.reduce((acc: Record<string, {count: number, pl: number}>, trade) => {
                        if (!acc[trade.pair]) {
                          acc[trade.pair] = { count: 0, pl: 0 };
                        }
                        acc[trade.pair].count++;
                        acc[trade.pair].pl += trade.total;
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b[1].pl - a[1].pl)
                      .slice(0, 3)
                      .map(([pair, data]) => (
                        <div key={pair} className="flex justify-between items-center mb-2 border-b pb-2">
                          <span className="font-medium">{pair}</span>
                          <span className="flex items-center gap-3">
                            <span className="text-gray-500">{data.count} صفقة</span>
                            <span className={data.pl > 0 ? "text-green-500" : "text-red-500"}>
                              ${data.pl.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ))
                    }
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">الأداء حسب العلامات</h3>
                    {Object.entries(
                      filteredTrades.reduce((acc: Record<string, {count: number, pl: number}>, trade) => {
                        trade.hashtags.forEach(tag => {
                          if (!acc[tag]) {
                            acc[tag] = { count: 0, pl: 0 };
                          }
                          acc[tag].count++;
                          acc[tag].pl += trade.total;
                        });
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b[1].pl - a[1].pl)
                      .slice(0, 3)
                      .map(([tag, data]) => (
                        <div key={tag} className="flex justify-between items-center mb-2 border-b pb-2">
                          <span className="font-medium">#{tag}</span>
                          <span className="flex items-center gap-3">
                            <span className="text-gray-500">{data.count} صفقة</span>
                            <span className={data.pl > 0 ? "text-green-500" : "text-red-500"}>
                              ${data.pl.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">لا توجد بيانات متاحة للفلاتر المحددة.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Trade Analysis */}
        <Tabs defaultValue="overview" className="w-full mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="trades">الصفقات</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Overview</CardTitle>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                <p className="mb-3">
                  Based on {filteredTrades.length} trades in the selected time range, your overall trading performance is 
                  <span className={netProfitLoss > 0 ? "text-green-500 font-semibold mx-1" : "text-red-500 font-semibold mx-1"}>
                    {netProfitLoss > 0 ? "profitable" : "showing a loss"}
                  </span> 
                  with a net result of 
                  <span className={netProfitLoss > 0 ? "text-green-500 font-semibold mx-1" : "text-red-500 font-semibold mx-1"}>
                    ${Math.abs(netProfitLoss).toFixed(2)}
                  </span>
                  after commission.
                </p>
                
                {filteredTrades.length > 0 && (
                  <div className="space-y-3">
                    <p>Your win rate is <span className="font-semibold">{winRate.toFixed(1)}%</span> with {winningTrades} winning trades and {losingTrades} losing trades.</p>
                    
                    {avgWin > 0 && avgLoss > 0 && (
                      <p>
                        Your average winning trade is <span className="text-green-500 font-semibold">${avgWin.toFixed(2)}</span> while 
                        your average losing trade is <span className="text-red-500 font-semibold">${avgLoss.toFixed(2)}</span>, 
                        giving you a win/loss ratio of <span className="font-semibold">{(avgWin / avgLoss).toFixed(2)}</span>.
                      </p>
                    )}
                    
                    {tradesWithDuration.length > 0 && (
                      <p>The average duration of your trades is <span className="font-semibold">{formatDuration(avgDuration)}</span>.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                {filteredTrades.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Performance by Pair</h3>
                    {Object.entries(
                      filteredTrades.reduce((acc: Record<string, {count: number, pl: number}>, trade) => {
                        if (!acc[trade.pair]) {
                          acc[trade.pair] = { count: 0, pl: 0 };
                        }
                        acc[trade.pair].count++;
                        acc[trade.pair].pl += trade.total;
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b[1].pl - a[1].pl)
                      .slice(0, 5)
                      .map(([pair, data]) => (
                        <div key={pair} className="flex justify-between items-center mb-2 border-b pb-2">
                          <span className="font-medium">{pair}</span>
                          <span className="flex items-center gap-3">
                            <span className="text-gray-500">{data.count} trades</span>
                            <span className={data.pl > 0 ? "text-green-500" : "text-red-500"}>
                              ${data.pl.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ))
                    }
                    
                    <h3 className="font-semibold text-lg mb-3 mt-6">Performance by Direction</h3>
                    <div className="flex justify-between items-center mb-2 border-b pb-2">
                      <span className="font-medium">Buy (Long)</span>
                      {(() => {
                        const buyTrades = filteredTrades.filter(t => t.type === 'Buy');
                        const buyPL = buyTrades.reduce((sum, t) => sum + t.total, 0);
                        return (
                          <span className="flex items-center gap-3">
                            <span className="text-gray-500">{buyTrades.length} trades</span>
                            <span className={buyPL > 0 ? "text-green-500" : "text-red-500"}>
                              ${buyPL.toFixed(2)}
                            </span>
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between items-center mb-2 border-b pb-2">
                      <span className="font-medium">Sell (Short)</span>
                      {(() => {
                        const sellTrades = filteredTrades.filter(t => t.type === 'Sell');
                        const sellPL = sellTrades.reduce((sum, t) => sum + t.total, 0);
                        return (
                          <span className="flex items-center gap-3">
                            <span className="text-gray-500">{sellTrades.length} trades</span>
                            <span className={sellPL > 0 ? "text-green-500" : "text-red-500"}>
                              ${sellPL.toFixed(2)}
                            </span>
                          </span>
                        );
                      })()}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-3 mt-6">Performance by Hashtag</h3>
                    {Object.entries(
                      filteredTrades.reduce((acc: Record<string, {count: number, pl: number}>, trade) => {
                        trade.hashtags.forEach(tag => {
                          if (!acc[tag]) {
                            acc[tag] = { count: 0, pl: 0 };
                          }
                          acc[tag].count++;
                          acc[tag].pl += trade.total;
                        });
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b[1].pl - a[1].pl)
                      .slice(0, 5)
                      .map(([tag, data]) => (
                        <div key={tag} className="flex justify-between items-center mb-2 border-b pb-2">
                          <span className="font-medium">#{tag}</span>
                          <span className="flex items-center gap-3">
                            <span className="text-gray-500">{data.count} trades</span>
                            <span className={data.pl > 0 ? "text-green-500" : "text-red-500"}>
                              ${data.pl.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p>No data available for the selected filters.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="trades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Trade List</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 dark:text-gray-300">
                  Showing {filteredTrades.length} trades that match the selected filters.
                </p>
                {filteredTrades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pair</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entry</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exit</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {filteredTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(trade => (
                          <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{trade.date}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{trade.pair}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                trade.type === 'Buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {trade.type}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{trade.entry}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{trade.exit || '-'}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{trade.lotSize}</td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium ${
                              trade.total > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              ${trade.total.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {trade.durationMinutes ? `${Math.floor(trade.durationMinutes / 60)}h ${trade.durationMinutes % 60}m` : '-'}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-300">
                              <div className="flex flex-wrap gap-1">
                                {trade.hashtags.slice(0, 2).map(tag => (
                                  <span key={tag} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs dark:bg-blue-900 dark:text-blue-300">
                                    #{tag}
                                  </span>
                                ))}
                                {trade.hashtags.length > 2 && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs dark:bg-gray-700 dark:text-gray-300">
                                    +{trade.hashtags.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No trades found with the selected filters.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
