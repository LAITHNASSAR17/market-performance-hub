
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTrade } from '@/contexts/TradeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  UserCheck, 
  UserX, 
  Search, 
  Lock, 
  ShieldAlert, 
  User, 
  Users, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Hash, 
  Calendar, 
  Activity, 
  Mail, 
  Settings, 
  FileUp, 
  Bell, 
  RefreshCw,
  Percent,
  Briefcase
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Import our admin components
import UserTable from '@/components/admin/UserTable';
import TradeTable from '@/components/admin/TradeTable';
import HashtagsTable from '@/components/admin/HashtagsTable';
import SystemSettings from '@/components/admin/SystemSettings';
import AdminCharts from '@/components/admin/AdminCharts';

// Sample data for hashtags
const sampleHashtags = [
  { 
    name: 'setup', 
    count: 25, 
    addedBy: 'Admin', 
    lastUsed: '2025-04-12' 
  },
  { 
    name: 'momentum', 
    count: 18, 
    addedBy: 'Admin', 
    lastUsed: '2025-04-12' 
  },
  { 
    name: 'breakout', 
    count: 22, 
    addedBy: 'Admin', 
    lastUsed: '2025-04-12' 
  },
  { 
    name: 'technical', 
    count: 15, 
    addedBy: 'Admin', 
    lastUsed: '2025-04-12' 
  },
  { 
    name: 'fundamental', 
    count: 10, 
    addedBy: 'Admin', 
    lastUsed: '2025-04-12' 
  },
];

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, users, getAllUsers, blockUser, unblockUser, changePassword } = useAuth();
  const { trades, getAllTrades, deleteTrade } = useTrade();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hashtags, setHashtags] = useState(sampleHashtags);
  const [allTrades, setAllTrades] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    if (isAdmin) {
      handleRefreshData();
    }
  }, [isAdmin]);

  // Statistics calculations
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(user => !user.isBlocked).length || 0;
  const blockedUsers = users?.filter(user => user.isBlocked).length || 0;
  
  // All trades (from all users) for admin
  const totalTrades = allTrades.length;
  
  // Calculate profit/loss and other trade statistics
  const allProfitLoss = allTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  
  const winningTrades = allTrades.filter(trade => trade.profitLoss > 0).length;
  const losingTrades = allTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  
  // Today's trades
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = allTrades.filter(trade => trade.date === today).length;
  const todayProfit = allTrades
    .filter(trade => trade.date === today)
    .reduce((sum, trade) => sum + trade.profitLoss, 0);
  
  // Find most traded pair
  const pairCount: Record<string, number> = {};
  allTrades.forEach(trade => {
    pairCount[trade.pair] = (pairCount[trade.pair] || 0) + 1;
  });
  
  let mostTradedPair = '';
  let highestCount = 0;
  
  for (const pair in pairCount) {
    if (pairCount[pair] > highestCount) {
      mostTradedPair = pair;
      highestCount = pairCount[pair];
    }
  }

  // Demo data
  const linkedAccounts = 12;
  const totalNotes = 87;

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleRefreshData = () => {
    // Fetch users data
    getAllUsers();
    
    // Fetch ALL trades across users for admin dashboard
    const allTradesData = trades || [];
    setAllTrades(allTradesData);
    
    // Update refresh timestamp
    setLastRefresh(new Date());
    
    toast({
      title: "Data Refreshed",
      description: "Admin dashboard data has been updated"
    });
  };

  const handleBlockUser = (user: any) => {
    blockUser(user);
    toast({
      title: "User Blocked",
      description: `${user.name} has been blocked`
    });
  };

  const handleUnblockUser = (user: any) => {
    unblockUser(user);
    toast({
      title: "User Unblocked",
      description: `${user.name} has been unblocked`
    });
  };

  const handleAddHashtag = (name: string) => {
    const newHashtag = {
      name,
      count: 0,
      addedBy: user?.name || 'Admin',
      lastUsed: new Date().toISOString().split('T')[0]
    };
    setHashtags([...hashtags, newHashtag]);
    toast({
      title: "Hashtag Added",
      description: `#${name} has been added to the system`
    });
  };

  const handleEditHashtag = (oldName: string, newName: string) => {
    const updatedHashtags = hashtags.map(tag => 
      tag.name === oldName ? { ...tag, name: newName } : tag
    );
    setHashtags(updatedHashtags);
    toast({
      title: "Hashtag Updated",
      description: `#${oldName} has been renamed to #${newName}`
    });
  };

  const handleDeleteHashtag = (name: string) => {
    const updatedHashtags = hashtags.filter(tag => tag.name !== name);
    setHashtags(updatedHashtags);
    toast({
      title: "Hashtag Deleted",
      description: `#${name} has been removed from the system`
    });
  };

  const handleViewTrade = (id: string) => {
    toast({
      title: "View Trade",
      description: `Viewing trade ${id}`
    });
    // Implementation would navigate to trade view
  };

  const handleEditTrade = (id: string) => {
    toast({
      title: "Edit Trade",
      description: `Editing trade ${id}`
    });
    // Implementation would navigate to trade edit
  };

  const handleDeleteTrade = (id: string) => {
    deleteTrade(id);
    // Update local state to reflect the deletion
    setAllTrades(allTrades.filter(trade => trade.id !== id));
    toast({
      title: "Trade Deleted",
      description: `Trade ${id} has been deleted`
    });
  };

  const handleExportTrades = () => {
    toast({
      title: "Export Initiated",
      description: "Trades export started"
    });
    // Implementation would export trades
  };

  const handleViewUser = (userId: string) => {
    toast({
      title: "View User",
      description: `Viewing user ${userId}`
    });
    // Implementation would navigate to user view
  };

  return (
    <Layout>
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-6">
        <div className="flex flex-col space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <ShieldAlert className="mr-2 h-6 md:h-8 w-6 md:w-8 text-purple-600" />
                لوحة تحكم الأدمن
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-500">
                إدارة المستخدمين، الصفقات، وإعدادات النظام.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-500">
              <span className="hidden md:inline">آخر تحديث: {lastRefresh.toLocaleTimeString()}</span>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"} 
                onClick={handleRefreshData}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {isMobile ? "تحديث" : "تحديث البيانات"}
              </Button>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              title="عدد المستخدمين"
              value={totalUsers}
              icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
              color="default"
              description={`نشط: ${activeUsers}`}
            />
            
            <StatCard
              title="إجمالي الصفقات"
              value={totalTrades}
              icon={<Activity className="h-4 md:h-5 w-4 md:w-5" />}
              color="default"
              description={`اليوم: ${todayTrades}`}
            />
            
            <StatCard
              title="إجمالي الربح/الخسارة"
              value={`$${allProfitLoss.toFixed(2)}`}
              icon={<DollarSign className="h-4 md:h-5 w-4 md:w-5" />}
              color={allProfitLoss > 0 ? "green" : allProfitLoss < 0 ? "red" : "default"}
              description={`اليوم: $${todayProfit.toFixed(2)}`}
              trend={allProfitLoss > 0 ? 'up' : allProfitLoss < 0 ? 'down' : 'neutral'}
            />
            
            <StatCard
              title="نسبة الربح"
              value={`${winRate}%`}
              icon={<Percent className="h-4 md:h-5 w-4 md:w-5" />}
              color="default"
              description={`ربح: ${winningTrades} / خسارة: ${losingTrades}`}
            />
            
            <StatCard
              title="حسابات التداول"
              value={linkedAccounts}
              icon={<Briefcase className="h-4 md:h-5 w-4 md:w-5" />}
              color="default"
            />
            
            <StatCard
              title="إجمالي الملاحظات"
              value={totalNotes}
              icon={<FileText className="h-4 md:h-5 w-4 md:w-5" />}
              color="default"
            />
            
            <StatCard
              title="الزوج الأكثر تداولاً"
              value={mostTradedPair || 'لا يوجد'}
              icon={<TrendingUp className="h-4 md:h-5 w-4 md:w-5" />}
              color="default"
              description={highestCount > 0 ? `${highestCount} صفقة` : 'لا توجد صفقات بعد'}
            />
            
            <StatCard
              title="المستخدمين المحظورين"
              value={blockedUsers}
              icon={<UserX className="h-4 md:h-5 w-4 md:w-5" />}
              color="red"
              description={blockedUsers > 0 ? `${blockedUsers} من ${totalUsers}` : 'لا يوجد'}
            />
          </div>

          {/* Charts Section */}
          <AdminCharts className="mt-4" />

          {/* Main Content */}
          <Tabs defaultValue="users" className="w-full mt-6">
            <TabsList className="mb-6 bg-white p-1 rounded-md overflow-x-auto flex whitespace-nowrap">
              <TabsTrigger value="users" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">إدارة المستخدمين</span>
                <span className="sm:hidden">المستخدمين</span>
              </TabsTrigger>
              <TabsTrigger value="trades" className="flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">إدارة الصفقات</span>
                <span className="sm:hidden">الصفقات</span>
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">إدارة الهاشتاغ</span>
                <span className="sm:hidden">الهاشتاغ</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">إدارة الملاحظات</span>
                <span className="sm:hidden">الملاحظات</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">إعدادات النظام</span>
                <span className="sm:hidden">الإعدادات</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>إدارة المستخدمين</CardTitle>
                  <CardDescription>عرض وإدارة حسابات المستخدمين.</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <UserTable 
                    users={users}
                    onBlock={handleBlockUser}
                    onUnblock={handleUnblockUser}
                    onChangePassword={changePassword}
                    onViewUser={handleViewUser}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trades" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>إدارة الصفقات</CardTitle>
                  <CardDescription>عرض وإدارة جميع الصفقات عبر المنصة.</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <TradeTable 
                    trades={allTrades}
                    onViewTrade={handleViewTrade}
                    onEditTrade={handleEditTrade}
                    onDeleteTrade={handleDeleteTrade}
                    onRefresh={handleRefreshData}
                    onExport={handleExportTrades}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hashtags" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>إدارة الهاشتاغ</CardTitle>
                  <CardDescription>إدارة الهاشتاغ المستخدمة عبر المنصة.</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <HashtagsTable 
                    hashtags={hashtags}
                    onAddHashtag={handleAddHashtag}
                    onEditHashtag={handleEditHashtag}
                    onDeleteHashtag={handleDeleteHashtag}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>إدارة الملاحظات</CardTitle>
                  <CardDescription>عرض وإدارة جميع ملاحظات المستخدمين.</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col sm:flex-row mb-4 gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 pr-4"
                        placeholder="بحث في الملاحظات..."
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">وحدة الملاحظات قريباً</h3>
                      <p>ميزة إدارة الملاحظات قيد التطوير وستكون متاحة في تحديث مستقبلي.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
