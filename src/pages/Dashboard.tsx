
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, AreaChart } from 'lucide-react';
import { addDays, format, getWeek, startOfMonth, endOfMonth, getDay } from 'date-fns';

// Services & Types
import { tradeService, ITrade } from '@/services/tradeService';

// Dashboard Components
import { TotalPLCard, ProfitFactorCard, AverageTradeCards } from '@/components/dashboard/TradingStats';
import WinRateChart from '@/components/dashboard/WinRateChart';
import TradeCalendar from '@/components/dashboard/TradeCalendar';
import RecentTrades from '@/components/dashboard/RecentTrades';
import TradeDetailsDialog from '@/components/TradeDetailsDialog';
import CumulativePLChart from '@/components/CumulativePLChart';
import DailyPLBarChart from '@/components/DailyPLBarChart';
import TradingTips from '@/components/TradingTips';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<any[]>([]);

  // Fetch trades
  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const fetchedTrades = await tradeService.getTradesByUserId(user.id);
        setTrades(fetchedTrades);
      } catch (error) {
        console.error('Error fetching trades:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch trades data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [user, toast]);
  
  // Fetch calendar data
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!user) return;
      
      try {
        const data = await tradeService.getCalendarData(user.id, calendarYear, calendarMonth);
        
        // Convert to calendar format
        const calendarData = getFormattedCalendarData(data, calendarMonth, calendarYear);
        setCalendarData(calendarData);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };
    
    fetchCalendarData();
  }, [user, calendarMonth, calendarYear]);

  // Calculate calendar data
  const getFormattedCalendarData = (dayData: any[], month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = getDay(firstDay);
    
    // Create the calendar grid with empty days for the first week
    const calendarDays = [];
    
    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find data for this day if it exists
      const dayDataItem = dayData.find(item => item.date === dateString);
      
      if (dayDataItem) {
        calendarDays.push(dayDataItem);
      } else {
        // If no data for this day, add a placeholder
        calendarDays.push({
          day,
          date: dateString,
          trades: 0,
          profit: 0
        });
      }
    }
    
    // Group into weeks
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < calendarDays.length; i++) {
      currentWeek.push(calendarDays[i]);
      
      if (currentWeek.length === 7 || i === calendarDays.length - 1) {
        // Calculate weekly totals
        const weeklyTotal = currentWeek
          .filter(day => day !== null)
          .reduce((sum, day) => sum + (day?.profit || 0), 0);
        
        const weeklyTrades = currentWeek
          .filter(day => day !== null)
          .reduce((sum, day) => sum + (day?.trades || 0), 0);
        
        // Get week number
        const weekNumber = currentWeek.some(day => day !== null) ? 
          getWeek(new Date(currentWeek.find(day => day !== null)?.date || new Date())) : 0;
        
        weeks.push({
          days: [...currentWeek],
          weeklyTotal,
          weeklyTrades,
          weekNumber
        });
        
        currentWeek = [];
      }
    }
    
    // If there are remaining days, pad with nulls to complete the week
    if (currentWeek.length > 0 && currentWeek.length < 7) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      
      const weeklyTotal = currentWeek
        .filter(day => day !== null)
        .reduce((sum, day) => sum + (day?.profit || 0), 0);
      
      const weeklyTrades = currentWeek
        .filter(day => day !== null)
        .reduce((sum, day) => sum + (day?.trades || 0), 0);
      
      const weekNumber = currentWeek.some(day => day !== null) ? 
        getWeek(new Date(currentWeek.find(day => day !== null)?.date || new Date())) : 0;
      
      weeks.push({
        days: [...currentWeek],
        weeklyTotal,
        weeklyTrades,
        weekNumber
      });
    }
    
    return weeks;
  };

  // Filter trades based on timeframe
  const filteredTrades = useMemo(() => {
    if (timeframeFilter === 'all') return trades;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeframeFilter === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeframeFilter === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeframeFilter === 'quarter') {
      cutoffDate.setMonth(now.getMonth() - 3);
    } else if (timeframeFilter === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return trades.filter(trade => new Date(trade.entryDate) >= cutoffDate);
  }, [trades, timeframeFilter]);

  // Calculate statistics from filtered trades
  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    
    if (totalTrades === 0) {
      return {
        totalPL: 0,
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        avgWinning: 0,
        avgLosing: 0
      };
    }
    
    const winningTrades = filteredTrades.filter(trade => (trade.profitLoss || 0) > 0);
    const losingTrades = filteredTrades.filter(trade => (trade.profitLoss || 0) < 0);
    
    const totalPL = filteredTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const winRate = (winningTrades.length / totalTrades) * 100;
    
    const totalWinning = winningTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
    const totalLosing = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0));
    
    const profitFactor = totalLosing > 0 ? totalWinning / totalLosing : totalWinning > 0 ? Infinity : 0;
    
    const avgWinning = winningTrades.length > 0 ? totalWinning / winningTrades.length : 0;
    const avgLosing = losingTrades.length > 0 ? totalLosing / losingTrades.length : 0;
    
    return {
      totalPL,
      winRate,
      profitFactor,
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWinning,
      avgLosing
    };
  }, [filteredTrades]);

  // Prepare chart data
  const [dailyPerformanceData, setDailyPerformanceData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDailyData = async () => {
      if (!user) return;
      
      try {
        const data = await tradeService.getDailyPLData(user.id, 7);
        setDailyPerformanceData(data);
      } catch (error) {
        console.error('Error fetching daily performance data:', error);
      }
    };
    
    fetchDailyData();
  }, [user]);

  // Handlers
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

  const handleDayClick = (dateString: string) => {
    setSelectedDate(dateString);
    setShowTradeDetails(true);
  };

  const handleCloseTradeDetails = () => {
    setShowTradeDetails(false);
  };

  const navigateToJournal = (dateString: string = '') => {
    if (dateString) {
      navigate(`/journal?date=${dateString}`);
    } else {
      navigate('/journal');
    }
  };
  
  const handleTradeView = (tradeId: string) => {
    navigate(`/trades/${tradeId}`);
  };
  
  const handleTradeDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const success = await tradeService.deleteTrade(id);
      
      if (success) {
        setTrades(trades.filter(trade => trade.id !== id));
        toast({
          title: "Trade deleted",
          description: "The trade has been successfully deleted"
        });
      } else {
        throw new Error("Failed to delete trade");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trade",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
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
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
        <TotalPLCard 
          value={stats.totalPL} 
          tradeCount={stats.totalTrades} 
        />
        
        <ProfitFactorCard value={stats.profitFactor} />
        
        <div className="md:col-span-2">
          <AverageTradeCards 
            avgWin={stats.avgWinning} 
            avgLoss={stats.avgLosing}
            winCount={stats.winningTrades}
            lossCount={stats.losingTrades}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
        <WinRateChart 
          winRate={stats.winRate} 
          winCount={stats.winningTrades} 
          lossCount={stats.losingTrades} 
        />

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">P&L Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <DailyPLBarChart 
                data={dailyPerformanceData}
                title=""
              />
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1">
          <TradingTips className="h-full" />
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Daily Net Cumulative P&L</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px]">
            <CumulativePLChart 
              data={dailyPerformanceData.map(item => ({
                date: item.date,
                value: item.profit
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <TradeCalendar 
        month={calendarMonth}
        year={calendarYear}
        calendarData={calendarData}
        onDayClick={handleDayClick}
        onMonthChange={(month, year) => {
          setCalendarMonth(month);
          setCalendarYear(year);
        }}
        onJournalClick={navigateToJournal}
      />
      
      <RecentTrades 
        trades={trades.slice(0, 10)}
        onViewTrade={handleTradeView}
        onDeleteTrade={handleTradeDelete}
      />
      
      <TradeDetailsDialog 
        isOpen={showTradeDetails}
        onClose={handleCloseTradeDetails}
        selectedDate={selectedDate}
        trades={trades.filter(t => {
          if (!selectedDate) return false;
          const tradeDate = new Date(t.entryDate).toISOString().split('T')[0];
          return tradeDate === selectedDate && t.userId === user?.id;
        })}
      />
    </Layout>
  );
};

export default Dashboard;
