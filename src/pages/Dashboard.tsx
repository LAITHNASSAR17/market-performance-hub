
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import TradeDetailsDialog from '@/components/TradeDetailsDialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import TradingInsights from '@/components/TradingInsights';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import PerformanceCharts from '@/components/dashboard/PerformanceCharts';
import { format, startOfMonth, eachDayOfInterval, getWeek } from 'date-fns';

const Dashboard: React.FC = () => {
  const { trades } = useTrade();
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

  const filteredTrades = React.useMemo(() => {
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

  const {
    totalProfit,
    winningTrades,
    losingTrades,
    totalTradesCount,
    winRateValue,
    avgWinningTrade,
    avgLosingTrade,
    profitFactor,
    dailyPerformanceData
  } = React.useMemo(() => {
    const totalProfit = filteredTrades.reduce((sum, trade) => sum + trade.total, 0);
    const winningTrades = filteredTrades.filter(trade => trade.total > 0).length;
    const losingTrades = filteredTrades.filter(trade => trade.total < 0).length;
    const totalTradesCount = filteredTrades.length;
    const winRateValue = totalTradesCount > 0 ? (winningTrades / totalTradesCount) * 100 : 0;
    
    const winningTradesData = filteredTrades.filter(trade => trade.total > 0);
    const avgWinningTrade = winningTradesData.length > 0 
      ? winningTradesData.reduce((sum, trade) => sum + trade.total, 0) / winningTradesData.length
      : 0;

    const losingTradesData = filteredTrades.filter(trade => trade.total < 0);
    const avgLosingTrade = losingTradesData.length > 0 
      ? losingTradesData.reduce((sum, trade) => sum + trade.total, 0) / losingTradesData.length
      : 0;

    const grossProfit = winningTradesData.reduce((sum, trade) => sum + trade.total, 0);
    const grossLoss = Math.abs(losingTradesData.reduce((sum, trade) => sum + trade.total, 0));
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
      const dayProfit = dayTrades.reduce((sum, trade) => sum + trade.total, 0);
      
      return {
        day: dayInfo.label,
        profit: dayProfit,
        date: dayInfo.date
      };
    });

    return {
      totalProfit,
      winningTrades,
      losingTrades,
      totalTradesCount,
      winRateValue,
      avgWinningTrade,
      avgLosingTrade,
      profitFactor,
      dailyPerformanceData
    };
  }, [filteredTrades]);

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
      const dateString = format(date, 'yyyy-MM-dd');
      const dayTrades = trades.filter(trade => trade.date === dateString);
      
      calendarDays.push({
        day,
        date: dateString,
        trades: dayTrades.length,
        profit: dayTrades.reduce((sum, trade) => sum + trade.total, 0)
      });
    }
    
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < calendarDays.length; i++) {
      currentWeek.push(calendarDays[i]);
      
      if (currentWeek.length === 7 || i === calendarDays.length - 1) {
        weeks.push({
          days: [...currentWeek],
        });
        
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0 && currentWeek.length < 7) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      
      weeks.push({
        days: [...currentWeek],
      });
    }
    
    return weeks;
  };

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

  return (
    <Layout>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">لوحة التحكم</h1>
          <p className="text-gray-500">نظرة عامة على أداء التداول الخاص بك</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="اختر إطار زمني" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الوقت</SelectItem>
              <SelectItem value="week">آخر 7 أيام</SelectItem>
              <SelectItem value="month">آخر 30 يوم</SelectItem>
              <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
              <SelectItem value="year">العام الماضي</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport} className="w-full sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      <DashboardStats 
        totalProfit={totalProfit}
        totalTradesCount={totalTradesCount}
        profitFactor={profitFactor}
        avgWinningTrade={avgWinningTrade}
        avgLosingTrade={avgLosingTrade}
        winningTrades={winningTrades}
        losingTrades={losingTrades}
      />

      <DashboardCalendar 
        trades={trades}
        onDayClick={handleDayClick}
        onNavigateToJournal={navigateToJournal}
        calendarData={getCalendarData()}
      />

      <PerformanceCharts 
        dailyPerformanceData={dailyPerformanceData}
        winRateValue={winRateValue}
        winningTrades={winningTrades}
        losingTrades={losingTrades}
      />

      <TradeDetailsDialog 
        isOpen={showTradeDetails}
        onClose={handleCloseTradeDetails}
        selectedDate={selectedDate}
        trades={trades.filter(t => t.date === selectedDate && t.userId === user?.id)}
      />
    </Layout>
  );
};

export default Dashboard;
