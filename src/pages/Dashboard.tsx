import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, User, Search, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import TradeDetailsDialog from '@/components/TradeDetailsDialog';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import DraggableDashboard from '@/components/dashboard/DraggableDashboard';
import DashboardCard from '@/components/dashboard/DashboardCard';
import StatisticCard from '@/components/dashboard/StatisticCard';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import MiniLineChart from '@/components/dashboard/MiniLineChart';
import CumulativePLChart from '@/components/CumulativePLChart';
import DailyPLBarChart from '@/components/DailyPLBarChart';
import AverageTradeCards from '@/components/AverageTradeCards';
import TradingTips from '@/components/TradingTips';
import { format } from 'date-fns';

const DashboardContent: React.FC = () => {
  const { trades, deleteTrade } = useTrade();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dashboardLayout, updateDashboardLayout, isLoading } = useDashboard();
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const userTrades = user ? trades.filter(trade => trade.userId === user.id) : [];

  const filteredTrades = useMemo(() => {
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
  }, [userTrades, timeframeFilter]);

  const totalTrades = filteredTrades.length;
  const totalProfit = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0).length;
  const losingTrades = filteredTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const winningTradesData = filteredTrades.filter(trade => trade.profitLoss > 0);
  const avgWinningTrade = winningTradesData.length > 0 
    ? winningTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0) / winningTradesData.length
    : 0;

  const losingTradesData = filteredTrades.filter(trade => trade.profitLoss < 0);
  const avgLosingTrade = losingTradesData.length > 0 
    ? losingTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0) / losingTradesData.length
    : 0;

  const grossProfit = winningTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const grossLoss = Math.abs(losingTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (winningTradesData.length > 0 ? Infinity : 0);

  const generateSampleData = (length = 10, trend: 'up' | 'down' | 'mixed' = 'up') => {
    return Array.from({ length }).map((_, i) => {
      let value;
      if (trend === 'up') {
        value = 20 + i * 5 + Math.random() * 10;
      } else if (trend === 'down') {
        value = 70 - i * 5 + Math.random() * 10;
      } else {
        value = 40 + Math.sin(i) * 20 + Math.random() * 10;
      }
      return { value };
    });
  };

  const salesChartData = generateSampleData(10, 'up');
  const revenueChartData = generateSampleData(10, 'mixed');

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

  const handelViewBadges = () => {
    navigate('/profile');
  };

  const handleCloseTradeDetails = () => {
    setShowTradeDetails(false);
  };

  const handleLayoutChange = (layout: any) => {
    updateDashboardLayout(layout);
  };

  const dashboardItems = [
    {
      id: 'welcome',
      title: '',
      w: 8,
      h: 2,
      x: 0,
      y: 0,
      component: (
        <WelcomeCard
          name={user?.name || 'Trader'}
          message={`You've completed ${totalTrades} trades this month. Check your latest stats in your trading profile.`}
          buttonText="View Stats"
          onButtonClick={handelViewBadges}
          className="h-full"
        />
      )
    },
    {
      id: 'total-pl',
      title: '',
      w: 4,
      h: 2,
      x: 8,
      y: 0,
      component: (
        <StatisticCard
          title="Total P&L"
          value={`$${totalProfit.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ 
            value: 28.42, 
            isPositive: totalProfit > 0 
          }}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          chartComponent={<MiniLineChart data={salesChartData} dataKey="value" stroke="#22c55e" type="area" />}
        />
      )
    },
    {
      id: 'profit-factor',
      title: '',
      w: 4,
      h: 2,
      x: 0,
      y: 2,
      component: (
        <StatisticCard
          title="Profit Factor"
          value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
          icon={<Activity className="h-4 w-4" />}
          trend={{ 
            value: profitFactor > 1 ? (profitFactor - 1) * 10 : 0, 
            isPositive: profitFactor > 1 
          }}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          chartComponent={<MiniLineChart data={revenueChartData} dataKey="value" stroke="#9b87f5" type="area" />}
        />
      )
    },
    {
      id: 'win-rate',
      title: '',
      w: 4,
      h: 2,
      x: 4,
      y: 2,
      component: (
        <DashboardCard className="h-full flex flex-col">
          <div className="h-full flex flex-col justify-center items-center text-center">
            <div className="relative w-24 h-24 mb-2">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">{winRate.toFixed(0)}%</span>
                <span className="text-xs text-gray-500">Win Rate</span>
              </div>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f1f1f1"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#9b87f5"
                  strokeWidth="10"
                  strokeDasharray={`${winRate * 2.512} ${(100 - winRate) * 2.512}`}
                  strokeDashoffset="0"
                  transform="rotate(-90, 50, 50)"
                />
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                <span className="text-xs">{winningTrades} Win</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                <span className="text-xs">{losingTrades} Loss</span>
              </div>
            </div>
          </div>
        </DashboardCard>
      )
    },
    {
      id: 'avg-trade',
      title: '',
      w: 4,
      h: 2,
      x: 8,
      y: 2,
      component: (
        <DashboardCard className="h-full">
          <div className="h-full flex flex-col">
            <div className="mb-2 text-sm text-gray-500">Average Trade</div>
            <div className="flex-1 flex items-center">
              <div className="w-1/2 flex flex-col items-center p-2 border-r">
                <div className="text-xl font-medium text-emerald-500">
                  ${avgWinningTrade.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Win</div>
              </div>
              <div className="w-1/2 flex flex-col items-center p-2">
                <div className="text-xl font-medium text-red-500">
                  ${Math.abs(avgLosingTrade).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Loss</div>
              </div>
            </div>
          </div>
        </DashboardCard>
      )
    },
    {
      id: 'daily-pl',
      title: 'Daily P&L',
      w: 8,
      h: 4,
      x: 0,
      y: 4,
      component: (
        <div className="h-full pt-2">
          <DailyPLBarChart 
            data={dailyPerformanceData}
            title=""
          />
        </div>
      )
    },
    {
      id: 'cumulative-pl',
      title: 'Cumulative P&L',
      w: 4,
      h: 4,
      x: 8,
      y: 4,
      component: (
        <div className="h-full pt-2">
          <CumulativePLChart 
            trades={filteredTrades}
          />
        </div>
      )
    },
    {
      id: 'trading-tips',
      title: 'Trading Tips',
      w: 4,
      h: 4,
      x: 0,
      y: 8,
      component: (
        <div className="h-full overflow-auto">
          <TradingTips className="p-0" />
        </div>
      )
    },
    {
      id: 'trade-calendar',
      title: 'Monthly Calendar',
      w: 8,
      h: 4,
      x: 4,
      y: 8,
      component: (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-purple-500" />
            <p>
              {format(new Date(), 'MMMM yyyy')}
              <br />
              <Button 
                variant="link" 
                className="mt-2 text-purple-500"
                onClick={() => navigate('/journal')}
              >
                Open Journal View
              </Button>
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="px-4 py-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">Trading Dashboard</span>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
              {timeframeFilter === 'all' ? 'All Time' : 
               timeframeFilter === 'week' ? 'Weekly' :
               timeframeFilter === 'month' ? 'Monthly' :
               timeframeFilter === 'quarter' ? 'Quarterly' : 'Yearly'}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Drag and drop dashboard elements to customize your view
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search trades..." 
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <DraggableDashboard 
          items={dashboardItems} 
          onLayoutChange={handleLayoutChange}
          savedLayout={dashboardLayout}
          className="pb-8"
        />
      )}

      <TradeDetailsDialog 
        isOpen={showTradeDetails}
        onClose={handleCloseTradeDetails}
        selectedDate={selectedDate}
        trades={trades.filter(t => t.date === selectedDate && t.userId === user?.id)}
      />
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </Layout>
  );
};

export default Dashboard;
