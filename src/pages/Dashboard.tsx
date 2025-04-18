
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TradeChart from '@/components/TradeChart';
import { ArrowUp, ArrowDown, DollarSign, BarChart3, PieChart, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import AverageTradeCards from '@/components/AverageTradeCards';
import TradeCalendar from '@/components/TradeCalendar';
import DailyPLBarChart from '@/components/DailyPLBarChart';
import CumulativePLChart from '@/components/CumulativePLChart';
import HashtagBadge from '@/components/HashtagBadge';
import TradingTips from '@/components/TradingTips';
import AccountSelector from '@/components/AccountSelector';

const Dashboard: React.FC = () => {
  const { trades, loading, selectedAccount } = useTrade();
  const [stats, setStats] = useState({
    totalProfitLoss: 0,
    winRate: 0,
    totalTrades: 0,
    profitFactor: 0,
    netProfit: 0,
    averageTrade: 0,
    largestWin: 0,
    largestLoss: 0,
    averageWin: 0,
    averageLoss: 0,
    profitableTrades: 0,
    lossTrades: 0,
    bestPair: '',
    worstPair: '',
    consecutiveWins: 0,
    consecutiveLosses: 0,
    averageHoldingTime: 0,
  });

  const filteredTrades = trades.filter(trade => trade.account === selectedAccount);
  
  useEffect(() => {
    // Skip calculations if there are no trades
    if (!filteredTrades.length) return;

    // Calculate total profit/loss
    const totalPL = filteredTrades.reduce((sum, trade) => sum + trade.total, 0);
    
    // Calculate win rate
    const winningTrades = filteredTrades.filter(trade => trade.total > 0);
    const losingTrades = filteredTrades.filter(trade => trade.total < 0);
    const winRate = winningTrades.length / filteredTrades.length * 100;
    
    // Calculate profit factor
    const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.total, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.total, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit;
    
    // Find largest win/loss
    const largestWin = Math.max(...filteredTrades.map(trade => trade.total), 0);
    const largestLoss = Math.min(...filteredTrades.map(trade => trade.total), 0);
    
    // Calculate averages
    const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
    const averageTrade = totalPL / filteredTrades.length;
    
    // Calculate best and worst pairs
    const pairPerformance = filteredTrades.reduce((acc, trade) => {
      if (!acc[trade.pair]) {
        acc[trade.pair] = { total: 0, count: 0 };
      }
      acc[trade.pair].total += trade.total;
      acc[trade.pair].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);
    
    const pairProfits = Object.entries(pairPerformance)
      .filter(([_, data]) => data.count >= 3)  // Only consider pairs with at least 3 trades
      .map(([pair, data]) => ({ pair, profit: data.total, avg: data.total / data.count }));
    
    const bestPair = pairProfits.length > 0 ? 
      pairProfits.reduce((best, curr) => curr.avg > best.avg ? curr : best).pair : '';
    
    const worstPair = pairProfits.length > 0 ? 
      pairProfits.reduce((worst, curr) => curr.avg < worst.avg ? curr : worst).pair : '';
    
    // Calculate consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentConsecutiveWins = 0;
    let currentConsecutiveLosses = 0;
    
    // Sort trades by date in ascending order
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedTrades.forEach(trade => {
      if (trade.total > 0) {
        currentConsecutiveWins++;
        currentConsecutiveLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
      } else if (trade.total < 0) {
        currentConsecutiveLosses++;
        currentConsecutiveWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
      }
    });
    
    // Calculate average holding time
    const tradesWithDuration = filteredTrades.filter(trade => trade.durationMinutes);
    const averageHoldingTime = tradesWithDuration.length > 0 ?
      tradesWithDuration.reduce((sum, trade) => sum + (trade.durationMinutes || 0), 0) / tradesWithDuration.length : 0;
    
    setStats({
      totalProfitLoss: totalPL,
      winRate,
      totalTrades: filteredTrades.length,
      profitFactor,
      netProfit: totalPL,
      averageTrade,
      largestWin,
      largestLoss,
      averageWin,
      averageLoss,
      profitableTrades: winningTrades.length,
      lossTrades: losingTrades.length,
      bestPair,
      worstPair,
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
      averageHoldingTime,
    });
  }, [filteredTrades]);

  // Calculate most common hashtags
  const hashtagFrequency = filteredTrades.flatMap(trade => trade.hashtags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topHashtags = Object.entries(hashtagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent trades
  const recentTrades = [...filteredTrades].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">لوحة التحكم</h1>
        <p className="text-gray-500">مؤشرات أداء التداول</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="صافي الربح" 
              value={stats.netProfit.toFixed(2)} 
              trend={stats.netProfit > 0 ? "up" : "down"}
              icon={<DollarSign />}
              className={stats.netProfit > 0 ? "bg-profit/10" : "bg-loss/10"}
              textClass={stats.netProfit > 0 ? "text-profit" : "text-loss"}
            />
            
            <StatCard 
              title="عدد الصفقات" 
              value={stats.totalTrades.toString()} 
              trend="neutral"
              icon={<BarChart3 />}
              className="bg-primary/10"
              textClass="text-primary"
            />
            
            <StatCard 
              title="نسبة الربح" 
              value={`${stats.winRate.toFixed(1)}%`} 
              trend={stats.winRate > 50 ? "up" : "down"}
              icon={<PieChart />}
              className={stats.winRate > 50 ? "bg-profit/10" : "bg-loss/10"}
              textClass={stats.winRate > 50 ? "text-profit" : "text-loss"}
            />
            
            <StatCard 
              title="عامل الربح" 
              value={stats.profitFactor.toFixed(2)} 
              trend={stats.profitFactor > 1 ? "up" : "down"}
              icon={<TrendingUp />}
              className={stats.profitFactor > 1 ? "bg-profit/10" : "bg-loss/10"}
              textClass={stats.profitFactor > 1 ? "text-profit" : "text-loss"}
            />
          </div>
        </div>
        
        <div className="md:col-span-1">
          <AccountSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                تحليل الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Tabs defaultValue="daily">
                  <TabsList className="mb-4">
                    <TabsTrigger value="daily">يومي</TabsTrigger>
                    <TabsTrigger value="cumulative">تراكمي</TabsTrigger>
                  </TabsList>
                  <TabsContent value="daily" className="h-[280px]">
                    <DailyPLBarChart trades={filteredTrades} />
                  </TabsContent>
                  <TabsContent value="cumulative" className="h-[280px]">
                    <CumulativePLChart trades={filteredTrades} />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  أحدث التداولات
                </CardTitle>
                <Link to="/trades">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentTrades.length > 0 ? (
                <div className="divide-y">
                  {recentTrades.map(trade => (
                    <div key={trade.id} className="p-4">
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            trade.total > 0 ? "bg-emerald-500" : "bg-red-500"
                          )} />
                          <span className="font-medium">{trade.pair}</span>
                        </div>
                        <div className={cn(
                          "font-medium",
                          trade.total > 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                          {trade.total > 0 ? '+' : ''}{trade.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <div>{new Date(trade.date).toLocaleDateString()}</div>
                        <div>{trade.type} • {trade.lotSize}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  لا توجد تداولات بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="order-2 md:order-1">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  الوسوم الشائعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topHashtags.length > 0 ? (
                  <div className="space-y-4">
                    {topHashtags.map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between">
                        <HashtagBadge tag={tag} />
                        <span className="text-sm font-medium bg-gray-100 rounded-full px-2 py-0.5">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    لا توجد وسوم بعد
                  </div>
                )}
              </CardContent>
            </Card>
            
            <AverageTradeCards 
              averageWin={stats.averageWin} 
              averageLoss={Math.abs(stats.averageLoss)}
              totalWins={stats.profitableTrades}
              totalLosses={stats.lossTrades}
            />
          </div>
        </div>
        
        <div className="md:col-span-2 order-1 md:order-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                التقويم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TradeCalendar trades={filteredTrades} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mb-10">
        <TradingTips />
      </div>
    </Layout>
  );
};

export default Dashboard;
