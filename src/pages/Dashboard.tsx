
import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import StatCard from '@/components/StatCard';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, CircleIcon, ExternalLink, Eye, Trash2, Menu, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
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
import TradeDetailsDialog from '@/components/TradeDetailsDialog';
import CumulativePLChart from '@/components/CumulativePLChart';
import DailyPLBarChart from '@/components/DailyPLBarChart';
import { addDays, startOfWeek, endOfWeek, format, isSameDay, isSameWeek, parseISO, isMonday, isSunday, getWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AverageTradeCards from '@/components/AverageTradeCards';
import TradingTips from '@/components/TradingTips';
import TradeCalendar from '@/components/TradeCalendar';

const Dashboard: React.FC = () => {
  const { trades, deleteTrade } = useTrade();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  
  const exportReport = () => {
    toast({
      title: "Exporting report",
      description: "Your trading report is being generated and will download shortly."
    });
    
    setTimeout(() => {
      toast({
        title: "Report exported",
        description: "Your trading report has been successfully downloaded.",
      });
    }, 1500);
  };

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
  
  const bestTrade = filteredTrades.length > 0 ? filteredTrades.reduce(
    (best, trade) => (trade.profitLoss > best.profitLoss ? trade : best),
    filteredTrades[0]
  ) : null;
  
  const worstTrade = filteredTrades.length > 0 ? filteredTrades.reduce(
    (worst, trade) => (trade.profitLoss < worst.profitLoss ? trade : worst),
    filteredTrades[0]
  ) : null;

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

  const handleDayClick = (dateString: string) => {
    setSelectedDate(dateString);
    setShowTradeDetails(true);
  };

  const handleCloseTradeDetails = () => {
    setShowTradeDetails(false);
  };

  const navigateToJournal = (dateString: string) => {
    navigate(`/journal?date=${dateString}`);
  };
  
  const handleTradeView = (tradeId: string) => {
    navigate(`/trades/${tradeId}`);
  };
  
  const handleTradeDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTrade(id);
    toast({
      title: "Trade deleted",
      description: "The trade has been successfully deleted"
    });
  };

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-2">
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Trading Dashboard</h1>
            <p className="text-gray-500">Overview of your trading performance</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <Button variant="outline" onClick={exportReport} className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <StatCard
            title="Total P&L"
            value={`$${totalProfit.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
            trend={totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'neutral'}
            icon={<DollarSign className="h-5 w-5" />}
            color={totalProfit > 0 ? 'green' : totalProfit < 0 ? 'red' : 'default'}
            description={`Trades in total: ${totalTrades}`}
          />
          <StatCard
            title="Profit factor"
            value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
            icon={<Activity className="h-5 w-5" />}
            description={`${profitFactor > 1 ? '+' : ''}${profitFactor === Infinity ? "" : (profitFactor - 1).toFixed(2)}`}
          />
          
          <div className="md:col-span-2">
            <AverageTradeCards 
              avgWin={avgWinningTrade} 
              avgLoss={avgLosingTrade}
              winCount={winningTrades}
              lossCount={losingTrades}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  Calendar
                  <CircleIcon className="h-4 w-4 ml-2 text-gray-400" />
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/journal')}>
                  Journal View
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TradeCalendar />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  Winning % By Trades
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex flex-col sm:flex-row items-center justify-center">
                <div className="relative w-[160px] h-[160px]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-emerald-500">{winRate.toFixed(0)}%</span>
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
                <div className="ml-0 mt-2 sm:mt-0 sm:ml-4">
                  <div>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Daily P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <DailyPLBarChart 
                  data={dailyPerformanceData}
                  title=""
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-3 sm:mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Top Trading Pairs</CardTitle>
            </CardHeader>
            <CardContent className="h-[230px]">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Start adding trades to see your top trading pairs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <TradeDetailsDialog 
          isOpen={showTradeDetails}
          onClose={handleCloseTradeDetails}
          selectedDate={selectedDate}
          trades={trades.filter(t => t.date === selectedDate && t.userId === user?.id)}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
