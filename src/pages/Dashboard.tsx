
import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import StatCard from '@/components/StatCard';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, CircleIcon, ExternalLink, Eye, 
  ChevronRight, ChevronLeft, Info, Plus, Filter, FileUp, Settings, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
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
import { addDays, startOfWeek, endOfWeek, format, isSameDay, isSameWeek, parseISO, isMonday, isSunday, getWeek, 
  startOfMonth, endOfMonth, getMonth, getYear, eachDayOfInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AverageTradeCards from '@/components/AverageTradeCards';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Dashboard: React.FC = () => {
  const { trades, deleteTrade } = useTrade();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeframeFilter, setTimeframeFilter] = useState('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [displayMode, setDisplayMode] = useState<'dollar' | 'percentage'>('dollar');
  
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

  // Current streak tracking
  const getCurrentStreak = () => {
    if (totalTrades === 0) return { days: 0, trades: 0, isPositive: true, profit: 0 };
    
    // Sort trades by date (newest first)
    const sortedTrades = [...filteredTrades].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get the most recent trade
    const latestTrade = sortedTrades[0];
    const isPositive = latestTrade.profitLoss > 0;
    
    // Count consecutive trades with the same result (win/loss)
    let streakCount = 0;
    let streakDays = 0;
    let lastDate = '';
    let totalProfit = 0;
    
    for (const trade of sortedTrades) {
      const isTradePositive = trade.profitLoss > 0;
      
      if (isTradePositive === isPositive) {
        streakCount++;
        totalProfit += trade.profitLoss;
        
        // Count unique days
        if (trade.date !== lastDate) {
          streakDays++;
          lastDate = trade.date;
        }
      } else {
        break;
      }
    }
    
    return { 
      days: streakDays, 
      trades: streakCount,
      isPositive,
      profit: totalProfit
    };
  };
  
  const streak = getCurrentStreak();

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
    const month = getMonth(currentMonth);
    const year = getYear(currentMonth);
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    
    // Fill in empty days for the first week
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Fill in actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().slice(0, 10);
      const dayTrades = userTrades.filter(trade => trade.date === dateString);
      
      calendarDays.push({
        day,
        date: dateString,
        trades: dayTrades.length,
        profit: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
        tradesDetails: dayTrades
      });
    }
    
    // Group days into weeks
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < calendarDays.length; i++) {
      currentWeek.push(calendarDays[i]);
      
      if (currentWeek.length === 7 || i === calendarDays.length - 1) {
        // If this is the last row and we don't have a full week, pad with null
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
        
        currentWeek = [];
      }
    }
    
    return weeks;
  };

  const calculateWeeklyPerformance = () => {
    // Get all weeks in the current month
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    // Create a map to store weekly data
    const weekMap = new Map();
    
    // Process each trade
    userTrades.forEach(trade => {
      const tradeDate = new Date(trade.date);
      // Only include trades from the current month
      if (tradeDate >= start && tradeDate <= end) {
        const week = getWeek(tradeDate);
        if (!weekMap.has(week)) {
          weekMap.set(week, {
            week,
            profit: 0,
            trades: 0,
            days: new Set()
          });
        }
        
        const weekData = weekMap.get(week);
        weekData.profit += trade.profitLoss;
        weekData.trades += 1;
        weekData.days.add(trade.date);
      }
    });
    
    // Convert map to array and calculate days
    return Array.from(weekMap.values()).map(week => ({
      ...week,
      days: week.days.size
    }));
  };
  
  const weeklyPerformance = calculateWeeklyPerformance();
  
  const handleDayClick = (day: any) => {
    if (!day || day.trades === 0) return;
    
    setSelectedDate(day.date);
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

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <Layout>
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-gray-500">Good morning!</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
              <SelectTrigger className="w-[130px] bg-white border shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <SelectValue placeholder="Timeframe" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex gap-2 items-center shadow-sm">
              <Filter className="h-4 w-4 text-purple-500" />
              <span>Filters</span>
            </Button>
            
            <Button variant="outline" className="flex gap-2 items-center shadow-sm">
              <Settings className="h-4 w-4 text-purple-500" />
              <span>Demo Data</span>
            </Button>
            
            <Button 
              className="bg-purple-600 hover:bg-purple-700" 
              onClick={() => navigate('/add-trade')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trade
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
          <Card className="border border-dashed rounded-lg shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center">
                  Net P&L
                  <Info className="h-4 w-4 ml-2 text-gray-400" />
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-green-500">
                  ${totalProfit.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                <div className="text-sm text-gray-500">
                  {totalTrades} trades in total
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-dashed rounded-lg shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center">
                  Profit Factor
                  <Info className="h-4 w-4 ml-2 text-gray-400" />
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-800">
                  {profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
                </div>
                <div className="ml-4 mt-1">
                  <svg width="70" height="70" viewBox="0 0 100 100" className="transform -rotate-90">
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
                      strokeDasharray={`${Math.min(profitFactor * 40, 251.2)} 251.2`}
                      strokeDashoffset="0"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-dashed rounded-lg shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center">
                  Current Streak
                  <Info className="h-4 w-4 ml-2 text-gray-400" />
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 justify-between">
                <div>
                  <div className="text-sm uppercase font-medium text-gray-500">DAYS</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
                      streak.isPositive ? "bg-green-500" : "bg-red-500"
                    )}>
                      {streak.days}
                    </div>
                    <div className="text-sm text-gray-500">
                      {streak.isPositive ? (
                        <span>{streak.days === 1 ? '1 day' : `${streak.days} days`}</span>
                      ) : (
                        <span className="text-red-500">-{streak.profit.toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm uppercase font-medium text-gray-500">TRADES</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
                      streak.isPositive ? "bg-green-500" : "bg-red-500"
                    )}>
                      {streak.trades}
                    </div>
                    <div className="text-sm text-gray-500">
                      {streak.trades === 1 ? '1 trade' : `${streak.trades} trades`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full",
                      streak.isPositive ? "bg-green-500" : "bg-red-500"
                    )} 
                    style={{ width: `${Math.min(streak.trades * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
          <Card className="xl:col-span-2 border border-dashed rounded-lg shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-lg">
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 text-sm shadow-sm">
                      <span>Choose view</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="end">
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setDisplayMode('dollar')}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Dollar
                        {displayMode === 'dollar' && <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setDisplayMode('percentage')}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Percentage
                        {displayMode === 'percentage' && <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-sm">
                <div className="text-center p-2 font-medium">Sun</div>
                <div className="text-center p-2 font-medium">Mon</div>
                <div className="text-center p-2 font-medium">Tue</div>
                <div className="text-center p-2 font-medium">Wed</div>
                <div className="text-center p-2 font-medium">Thu</div>
                <div className="text-center p-2 font-medium">Fri</div>
                <div className="text-center p-2 font-medium">Sat</div>
                
                {getCalendarData().map((week, weekIndex) => (
                  <React.Fragment key={`week-${weekIndex}`}>
                    {week.days.map((day, dayIndex) => 
                      day === null ? (
                        <div key={`empty-${weekIndex}-${dayIndex}`} className="p-2 h-[80px]"></div>
                      ) : (
                        <div 
                          key={`day-${day.day}`} 
                          className={cn(
                            "border rounded p-2 text-left min-h-[80px] transition-colors",
                            day.profit > 0 
                              ? "bg-green-50 border-green-100 hover:bg-green-100" 
                              : day.profit < 0 
                                ? "bg-red-50 border-red-100 hover:bg-red-100" 
                                : day.trades > 0 
                                  ? "bg-gray-50 border-gray-100 hover:bg-gray-100"
                                  : "border-gray-100 hover:bg-gray-50",
                            day.trades > 0 && "cursor-pointer"
                          )}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className="text-xs font-medium">{day.day}</div>
                          {day.trades > 0 && (
                            <>
                              <div className={cn(
                                "text-sm font-bold mt-1",
                                day.profit > 0 ? "text-emerald-600" : day.profit < 0 ? "text-red-600" : "text-gray-600"
                              )}>
                                {displayMode === 'dollar' && (
                                  <>{day.profit > 0 ? '+' : ''}{day.profit.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                  })}</>
                                )}
                                {displayMode === 'percentage' && (
                                  <>{day.profit > 0 ? '+' : ''}{(day.profit / 1000 * 100).toFixed(1)}%</>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{day.trades} {day.trades === 1 ? 'trade' : 'trades'}</div>
                              {day.tradesDetails && day.tradesDetails.length > 0 && (
                                <div className="mt-1 flex gap-1 flex-wrap">
                                  {day.tradesDetails.slice(0, 2).map((trade, i) => (
                                    <Badge 
                                      key={i} 
                                      variant={trade.profitLoss > 0 ? "success" : "destructive"}
                                      className="text-[9px] px-1 py-0 h-4"
                                    >
                                      {trade.pair}
                                    </Badge>
                                  ))}
                                  {day.tradesDetails.length > 2 && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-[9px] px-1 py-0 h-4 bg-white"
                                    >
                                      +{day.tradesDetails.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Card className="border border-dashed rounded-lg shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Monthly stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-500">
                    ${totalProfit.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className="text-gray-500">{totalTrades} days</div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${winRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {weeklyPerformance.map((week, index) => (
              <Card key={index} className="border border-dashed rounded-lg shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">Week {week.week}</div>
                    <div className="text-xs text-gray-500">{week.days} days</div>
                  </div>
                  <div className={cn(
                    "text-xl font-bold",
                    week.profit > 0 ? "text-green-500" : week.profit < 0 ? "text-red-500" : "text-gray-500"
                  )}>
                    ${week.profit.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className="text-xs text-gray-500">{week.trades} {week.trades === 1 ? 'trade' : 'trades'}</div>
                </CardContent>
              </Card>
            ))}
            
            {weeklyPerformance.length === 0 && Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border border-dashed rounded-lg shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">Week {index + 1}</div>
                    <div className="text-xs text-gray-500">0 days</div>
                  </div>
                  <div className="text-xl font-bold text-gray-500">$0.00</div>
                  <div className="text-xs text-gray-500">0 trades</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <Card className="border border-dashed rounded-lg shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold">Daily Net Cumulative P&L</CardTitle>
                <Button variant="outline" size="sm" className="flex items-center gap-2 text-sm shadow-sm">
                  <FileUp className="h-4 w-4" />
                  <span>Import trades</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <DailyPLBarChart 
                data={dailyPerformanceData}
                title=""
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-full bg-pink-500 text-white hover:bg-pink-600 px-6 border-none">
            Review your performance
          </Button>
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
