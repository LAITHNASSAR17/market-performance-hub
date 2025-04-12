
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
  Server,
  ShieldAlert
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-purple-600" />
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
          color={stats.systemHealth?.databaseStatus === 'online' ? 'green' : 'red'}
        />
        
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color="red"
          description={`${stats.blockedUsers} of ${stats.totalUsers}`}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Analytics Overview</h2>
        <AdminCharts />
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4 dark:text-white">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Database Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                stats.systemHealth?.databaseStatus === 'online' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {stats.systemHealth?.databaseStatus || 'Offline'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Last Backup</span>
              <span className="text-gray-800 dark:text-gray-200">
                {stats.systemHealth?.lastBackup 
                  ? new Date(stats.systemHealth.lastBackup).toLocaleString() 
                  : 'Never'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Error Count (24h)</span>
              <span className={`text-gray-800 dark:text-gray-200 ${
                stats.systemHealth?.errorCount > 0 ? 'text-amber-600 dark:text-amber-400' : ''
              }`}>
                {stats.systemHealth?.errorCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Server Load</span>
              <span className="text-gray-800 dark:text-gray-200">Normal</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Popular Tags</h3>
          {stats.popularTags && stats.popularTags.length > 0 ? (
            <div className="space-y-3">
              {stats.popularTags.map((tag: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-2">
                      #{tag.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Used {tag.count} times
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(tag.count / 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tags data available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Backup Database</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Export Reports</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Manage Users</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2">
            <Server className="h-5 w-5" />
            <span>System Settings</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Recent Activity</h3>
        <div className="space-y-4">
          {/* Show loading state if data is loading */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : (
            // Mock data for recent activity - would be replaced with real data
            <>
              <div className="border-l-4 border-green-500 pl-4 py-1">
                <p className="text-sm font-medium dark:text-white">New user registered</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">10 minutes ago</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-sm font-medium dark:text-white">Trade report generated</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-1">
                <p className="text-sm font-medium dark:text-white">System backup completed</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-1">
                <p className="text-sm font-medium dark:text-white">System settings updated</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</p>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
