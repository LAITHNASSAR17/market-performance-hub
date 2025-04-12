
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Briefcase,
  Database,
  Server
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';

// Import our admin components
import AdminCharts from '@/components/admin/AdminCharts';
import { AdminController } from '@/controllers/AdminController';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalTrades: 0,
    recentTrades: 0,
    totalProfitLoss: 0,
    totalTags: 0,
    popularTags: [],
    systemHealth: {
      databaseStatus: 'offline',
      lastBackup: null,
      errorCount: 0
    }
  });
  
  const adminController = new AdminController();

  // Load initial data
  useEffect(() => {
    handleRefreshData();
  }, []);

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const dashboardStats = await adminController.getDashboardStats();
      setStats(dashboardStats);
      
      // Update refresh timestamp
      setLastRefresh(new Date());
      
      toast({
        title: "Data Refreshed",
        description: "Admin dashboard data has been updated"
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
            Overview of platform performance and activity.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="hidden md:inline">Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={handleRefreshData}
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {isMobile ? "Refresh" : "Refresh Data"}
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`Active: ${stats.activeUsers}`}
        />
        
        <StatCard
          title="Total Trades"
          value={stats.totalTrades}
          icon={<TrendingUp className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`Recent: ${stats.recentTrades}`}
        />
        
        <StatCard
          title="Total P&L"
          value={`$${stats.totalProfitLoss.toFixed(2)}`}
          icon={<DollarSign className="h-4 md:h-5 w-4 md:w-5" />}
          color={stats.totalProfitLoss > 0 ? "green" : stats.totalProfitLoss < 0 ? "red" : "default"}
          trend={stats.totalProfitLoss > 0 ? 'up' : stats.totalProfitLoss < 0 ? 'down' : 'neutral'}
        />
        
        <StatCard
          title="Win Rate"
          value={stats.totalTrades > 0 ? `${Math.round((stats.totalTrades - (stats.lossTrades || 0)) / stats.totalTrades * 100)}%` : '0%'}
          icon={<Percent className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
        />
        
        <StatCard
          title="Trading Accounts"
          value={stats.tradingAccounts || 0}
          icon={<Briefcase className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
        />
        
        <StatCard
          title="Total Tags"
          value={stats.totalTags}
          icon={<FileText className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
        />
        
        <StatCard
          title="Database"
          value={stats.systemHealth?.databaseStatus || 'Offline'}
          icon={<Database className="h-4 md:h-5 w-4 md:w-5" />}
          color={stats.systemHealth?.databaseStatus === 'online' ? "green" : "red"}
          description={stats.systemHealth?.lastBackup ? `Last backup: ${new Date(stats.systemHealth.lastBackup).toLocaleDateString()}` : 'No backup'}
        />
        
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color={stats.blockedUsers > 0 ? "red" : "green"}
          description={stats.blockedUsers > 0 ? `${stats.blockedUsers} of ${stats.totalUsers}` : 'None'}
        />
      </div>

      {/* Charts Section */}
      <AdminCharts className="mb-6" />

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
            <Users className="h-6 w-6 mb-2" />
            <span>Manage Users</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
            <TrendingUp className="h-6 w-6 mb-2" />
            <span>View Trades</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
            <BarChart3 className="h-6 w-6 mb-2" />
            <span>Generate Reports</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center" onClick={() => adminController.backupDatabase()}>
            <Server className="h-6 w-6 mb-2" />
            <span>Backup Database</span>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
