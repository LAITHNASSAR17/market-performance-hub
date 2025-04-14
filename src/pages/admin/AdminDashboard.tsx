
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrade } from '@/contexts/TradeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  RefreshCw,
  Users, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Percent,
  Briefcase
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import AdminCharts from '@/components/admin/AdminCharts';

const AdminDashboard: React.FC = () => {
  const { users, getAllUsers } = useAuth();
  const { trades, getAllTrades } = useTrade();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [allTrades, setAllTrades] = useState<any[]>([]);
  const [totalNotes, setTotalNotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    handleRefreshData();
  }, []);

  // Fetch data from database
  const fetchStatsFromDatabase = async () => {
    try {
      // Get total notes count
      const { count: notesCount, error: notesError } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });
      
      if (!notesError && notesCount !== null) {
        setTotalNotes(notesCount);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Statistics calculations
  const totalUsers = users ? users.length : 0;
  const activeUsers = users ? users.filter(user => !user.isBlocked).length : 0;
  const blockedUsers = users ? users.filter(user => user.isBlocked).length : 0;
  const adminUsers = users ? users.filter(user => user.isAdmin).length : 0;
  
  // All trades (from all users) for admin
  const totalTrades = allTrades.length;
  
  // Calculate profit/loss and other trade statistics
  const allProfitLoss = allTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  
  const winningTrades = allTrades.filter(trade => (trade.profitLoss || 0) > 0).length;
  const losingTrades = allTrades.filter(trade => (trade.profitLoss || 0) < 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  
  // Today's trades
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = allTrades.filter(trade => 
    new Date(trade.entry_date).toISOString().split('T')[0] === today).length;
  
  const todayProfit = allTrades
    .filter(trade => new Date(trade.entry_date).toISOString().split('T')[0] === today)
    .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  
  // Find most traded symbol
  const symbolCount: Record<string, number> = {};
  allTrades.forEach(trade => {
    symbolCount[trade.symbol] = (symbolCount[trade.symbol] || 0) + 1;
  });
  
  let mostTradedSymbol = '';
  let highestCount = 0;
  
  for (const symbol in symbolCount) {
    if (symbolCount[symbol] > highestCount) {
      mostTradedSymbol = symbol;
      highestCount = symbolCount[symbol];
    }
  }

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      // Fetch users data
      await getAllUsers();
      
      // Fetch ALL trades across users for admin dashboard
      const tradesData = await getAllTrades();
      setAllTrades(tradesData);
      
      // Fetch additional statistics
      await fetchStatsFromDatabase();
      
      // Update refresh timestamp
      setLastRefresh(new Date());
      
      toast({
        title: "البيانات محدثة",
        description: "تم تحديث بيانات لوحة الإدارة"
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث البيانات. الرجاء المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            لوحة تحكم الإدارة
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
            نظرة عامة على أداء المنصة والنشاط.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-500">
          <span className="hidden md:inline">آخر تحديث: {lastRefresh.toLocaleTimeString()}</span>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={handleRefreshData}
            className="flex items-center"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ml-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isMobile ? "تحديث" : "تحديث البيانات"}
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="إجمالي المستخدمين"
          value={totalUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`نشط: ${activeUsers}`}
        />
        
        <StatCard
          title="المستخدمين الإداريين"
          value={adminUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color="blue"
          description={`من أصل: ${totalUsers}`}
        />
        
        <StatCard
          title="المستخدمين المحظورين"
          value={blockedUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color="red"
          description={blockedUsers > 0 ? `${blockedUsers} من ${totalUsers}` : 'لا يوجد'}
        />
        
        <StatCard
          title="إجمالي الصفقات"
          value={totalTrades}
          icon={<TrendingUp className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`اليوم: ${todayTrades}`}
        />
        
        <StatCard
          title="نسبة الربح"
          value={`${winRate}%`}
          icon={<Percent className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`رابحة: ${winningTrades} / خاسرة: ${losingTrades}`}
        />
        
        <StatCard
          title="الرمز الأكثر تداولاً"
          value={mostTradedSymbol || 'غير متوفر'}
          icon={<TrendingUp className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={highestCount > 0 ? `${highestCount} صفقات` : 'لا توجد صفقات بعد'}
        />
        
        <StatCard
          title="إجمالي الملاحظات"
          value={totalNotes}
          icon={<FileText className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
        />
        
        <StatCard
          title="حالة النظام"
          value="نشط"
          icon={<BarChart3 className="h-4 md:h-5 w-4 md:w-5" />}
          color="green"
          description="جميع الخدمات تعمل"
        />
      </div>

      {/* Charts Section */}
      <AdminCharts className="mb-6" />

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center" onClick={() => window.location.href = '/admin/users'}>
            <Users className="h-6 w-6 mb-2" />
            <span>إدارة المستخدمين</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center" onClick={() => window.location.href = '/admin/trades'}>
            <TrendingUp className="h-6 w-6 mb-2" />
            <span>عرض الصفقات</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center" onClick={() => window.location.href = '/admin/notes'}>
            <FileText className="h-6 w-6 mb-2" />
            <span>إدارة الملاحظات</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center" onClick={() => window.location.href = '/admin/settings'}>
            <BarChart3 className="h-6 w-6 mb-2" />
            <span>إعدادات النظام</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
