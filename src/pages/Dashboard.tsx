
import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { Calendar, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import TradeDetailsDialog from '@/components/TradeDetailsDialog';
import { format, getWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TradingTips from '@/components/TradingTips';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import DashboardStatsGrid from '@/components/dashboard/DashboardStatsGrid';
import WinrateCharts from '@/components/dashboard/WinrateCharts';
import OpenPositionsCard from '@/components/dashboard/OpenPositionsCard';
import DailyPLBarChart from '@/components/DailyPLBarChart';

const Dashboard: React.FC = () => {
  const { trades, deleteTrade } = useTrade();
  const stats = useAnalyticsStats();
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

  const winRate = stats.totalTrades > 0 
    ? (stats.winningTrades / stats.totalTrades) * 100 
    : 0;

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
    
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < calendarDays.length; i++) {
      currentWeek.push(calendarDays[i]);
      
      if (currentWeek.length === 7 || i === calendarDays.length - 1) {
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
        
        currentWeek = [];
      }
    }
    
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
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="mb-6">
        <DashboardStatsGrid stats={stats} />
      </div>

      {/* Winrate Charts and Trading Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <WinrateCharts 
            winRate={winRate} 
            winningTrades={stats.winningTrades} 
            losingTrades={stats.losingTrades} 
          />
        </div>
        <div className="lg:col-span-1">
          <TradingTips className="h-full" />
        </div>
      </div>

      {/* Open Positions and PL Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1">
          <OpenPositionsCard />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <Tabs defaultValue="daily_net_cumulative">
                <TabsList className="mb-2">
                  <TabsTrigger value="daily_net_cumulative">Daily Net Cumulative P&L</TabsTrigger>
                  <TabsTrigger value="net_daily">Net Daily P&L</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px]">
              <DailyPLBarChart 
                data={dailyPerformanceData}
                title=""
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Calendar */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-2">
          <CardTitle className="text-lg">{format(new Date(), 'MMMM yyyy')}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/journal')}>
            <Calendar className="h-4 w-4 mr-2" />
            Journal View
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[768px] md:min-w-0">
            <div className="grid grid-cols-7 gap-1">
              <div className="text-sm font-medium text-center p-2">Sun</div>
              <div className="text-sm font-medium text-center p-2">Mon</div>
              <div className="text-sm font-medium text-center p-2">Tue</div>
              <div className="text-sm font-medium text-center p-2">Wed</div>
              <div className="text-sm font-medium text-center p-2">Thu</div>
              <div className="text-sm font-medium text-center p-2">Fri</div>
              <div className="text-sm font-medium text-center p-2">Sat</div>
              
              {getCalendarData().map((week, weekIndex) => (
                <React.Fragment key={`week-${weekIndex}`}>
                  {week.days.map((day, dayIndex) => 
                    day === null ? (
                      <div key={`empty-${weekIndex}-${dayIndex}`} className="p-2"></div>
                    ) : (
                      <div 
                        key={`day-${day.day}`} 
                        className={cn(
                          "border rounded p-2 text-center min-h-[70px] sm:min-h-[80px] cursor-pointer transition-colors",
                          day.profit > 0 ? "bg-green-50 border-green-200 hover:bg-green-100" : 
                          day.profit < 0 ? "bg-red-50 border-red-200 hover:bg-red-100" : 
                          "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        )}
                        onClick={() => handleDayClick(day.date)}
                      >
                        <div className="text-sm">{day.day}</div>
                        {day.trades > 0 && (
                          <>
                            <div className={cn(
                              "text-base sm:text-lg font-bold mt-1",
                              day.profit > 0 ? "text-emerald-500" : "text-red-500"
                            )}>
                              {day.profit > 0 ? '+' : ''}{day.profit.toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-500">{day.trades} {day.trades === 1 ? 'trade' : 'trades'}</div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1 text-xs h-6 px-2 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToJournal(day.date);
                              }}
                            >
                              View
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  )}
                  
                  <div className="col-span-7 mt-1 mb-4 flex justify-end">
                    <div className="w-full sm:w-[200px] bg-gray-50 border rounded-md p-3 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Week {week.weekNumber}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {week.weeklyTrades} {week.weeklyTrades === 1 ? 'trade' : 'trades'}
                        </span>
                      </div>
                      <div className={cn(
                        "font-bold text-lg",
                        week.weeklyTotal > 0 ? "text-emerald-600" : week.weeklyTotal < 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        {week.weeklyTotal > 0 ? "+" : ""}{week.weeklyTotal.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Net P&L for week {week.weekNumber}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
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
