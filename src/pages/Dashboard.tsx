import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import StatCard from '@/components/StatCard';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Calendar, 
  CircleIcon, 
  ExternalLink, 
  Eye, 
  Trash2, 
  Menu, 
  ChevronRight, 
  FileUp, 
  CheckCircle2,
  Home,
  BookText,
  LineChart,
  LogOut,
  PlusCircle,
  Settings,
  Sparkles,
  X,
  UserCog,
  ShieldAlert,
  LineChart as LineChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
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
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AverageTradeCards from '@/components/AverageTradeCards';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import LanguageToggle from '@/components/LanguageToggle';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const { trades, deleteTrade } = useTrade();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();
  
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

  const navigation = [
    { name: t('nav.dashboard'), icon: Home, href: '/dashboard' },
    { name: t('nav.addTrade'), icon: PlusCircle, href: '/add-trade' },
    { name: t('nav.trades'), icon: BookText, href: '/trades' },
    { name: t('nav.journal'), icon: Calendar, href: '/journal' },
    { name: t('nav.notebook'), icon: BookText, href: '/notebook' },
    { name: t('nav.reports'), icon: BarChart2, href: '/reports' },
    { name: t('nav.insights'), icon: Sparkles, href: '/insights' },
    { name: t('analytics.title') || 'Analytics', icon: BarChart2, href: '/analytics' },
    { name: t('chart.title') || 'Chart', icon: LineChart3, href: '/chart' },
  ];

  if (isAdmin) {
    navigation.push({ name: t('nav.adminPanel'), icon: ShieldAlert, href: '/admin' });
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
      <div className="flex h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`fixed top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-50 md:hidden`}>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full bg-white shadow-md"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div
          className={cn(
            "fixed inset-y-0 transform bg-trading-blue text-white shadow-lg transition-transform duration-300 ease-in-out md:relative",
            language === 'ar' 
              ? (sidebarOpen ? "translate-x-0 right-0" : "translate-x-full right-0") 
              : (sidebarOpen ? "translate-x-0 left-0" : "-translate-x-full left-0"),
            "w-64 md:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-trading-blue-dark">
              <h1 className="text-xl font-bold text-white">{t('nav.platform')}</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-trading-blue-dark"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <RouterLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                      location.pathname === item.href
                        ? "bg-trading-blue-dark text-white"
                        : "text-white hover:bg-trading-blue-dark"
                    )}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <item.icon className={`h-5 w-5 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    {item.name}
                  </RouterLink>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-trading-blue-dark">
              <div className="mb-4">
                <p className="text-sm font-medium text-white">{t('nav.loggedInAs')}</p>
                <p className="text-sm text-gray-300 truncate">{user?.name}</p>
                {isAdmin && (
                  <Badge className="mt-1 bg-purple-500">{t('nav.admin')}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-white border-white hover:bg-trading-blue-dark"
                  onClick={logout}
                >
                  <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('nav.logout')}
                </Button>
                
                <LanguageToggle className="text-white hover:bg-trading-blue-dark" />
              </div>
            </div>
          </div>
        </div>

        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-trading-background p-6">
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
              <Button variant="outline" onClick={exportReport}>
                <Calendar className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
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
            
            <div className="lg:col-span-2">
              <AverageTradeCards 
                avgWin={avgWinningTrade} 
                avgLoss={avgLosingTrade}
                winCount={winningTrades}
                lossCount={losingTrades}
              />
            </div>
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-bold text-emerald-500">{winRate.toFixed(0)}%</span>
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
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">P&L Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DailyPLBarChart 
                    data={dailyPerformanceData}
                    title=""
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Daily Net Cumulative P&L</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <DailyPLBarChart 
                  data={dailyPerformanceData}
                  title=""
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{format(new Date(), 'MMMM yyyy')}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/journal')}>
                <Calendar className="h-4 w-4 mr-2" />
                Journal View
              </Button>
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
                
                {getCalendarData().map((week, weekIndex) => (
                  <React.Fragment key={`week-${weekIndex}`}>
                    {week.days.map((day, dayIndex) => 
                      day === null ? (
                        <div key={`empty-${weekIndex}-${dayIndex}`} className="p-2"></div>
                      ) : (
                        <div 
                          key={`day-${day.day}`} 
                          className={cn(
                            "border rounded p-2 text-center min-h-[80px] cursor-pointer transition-colors",
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
                                "text-lg font-bold mt-1",
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
                      <div className="w-[200px] bg-gray-50 border rounded-md p-3 flex flex-col">
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
            </CardContent>
          </Card>
          
          <TradeDetailsDialog 
            isOpen={showTradeDetails}
            onClose={handleCloseTradeDetails}
            selectedDate={selectedDate}
            trades={trades.filter(t => t.date === selectedDate && t.userId === user?.id)}
          />
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;
