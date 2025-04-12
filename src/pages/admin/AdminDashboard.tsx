
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Import our admin components
import AdminCharts from '@/components/admin/AdminCharts';

const AdminDashboard: React.FC = () => {
  const { users, getAllUsers } = useAuth();
  const { trades, getAllTrades } = useTrade();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [allTrades, setAllTrades] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    handleRefreshData();
  }, []);

  // Statistics calculations - now derived from loaded data
  const totalUsers = users ? users.length : 0;
  const activeUsers = users ? users.filter(user => !user.isBlocked).length : 0;
  const blockedUsers = users ? users.filter(user => user.isBlocked).length : 0;
  
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

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
            Overview of platform performance and activity.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-500">
          <span className="hidden md:inline">Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={handleRefreshData}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {isMobile ? "Refresh" : "Refresh Data"}
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`Active: ${activeUsers}`}
        />
        
        <StatCard
          title="Total Trades"
          value={totalTrades}
          icon={<TrendingUp className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`Today: ${todayTrades}`}
        />
        
        <StatCard
          title="Total P&L"
          value={`$${allProfitLoss.toFixed(2)}`}
          icon={<DollarSign className="h-4 md:h-5 w-4 md:w-5" />}
          color={allProfitLoss > 0 ? "green" : allProfitLoss < 0 ? "red" : "default"}
          description={`Today: $${todayProfit.toFixed(2)}`}
          trend={allProfitLoss > 0 ? 'up' : allProfitLoss < 0 ? 'down' : 'neutral'}
        />
        
        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          icon={<Percent className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={`W: ${winningTrades} / L: ${losingTrades}`}
        />
        
        <StatCard
          title="Trading Accounts"
          value={linkedAccounts}
          icon={<Briefcase className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
        />
        
        <StatCard
          title="Total Notes"
          value={totalNotes}
          icon={<FileText className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
        />
        
        <StatCard
          title="Most Traded Pair"
          value={mostTradedPair || 'N/A'}
          icon={<TrendingUp className="h-4 md:h-5 w-4 md:w-5" />}
          color="default"
          description={highestCount > 0 ? `${highestCount} trades` : 'No trades yet'}
        />
        
        <StatCard
          title="Blocked Users"
          value={blockedUsers}
          icon={<Users className="h-4 md:h-5 w-4 md:w-5" />}
          color="red"
          description={blockedUsers > 0 ? `${blockedUsers} of ${totalUsers}` : 'None'}
        />
      </div>

      {/* Charts Section */}
      <AdminCharts className="mb-6" />

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
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
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
            <FileText className="h-6 w-6 mb-2" />
            <span>Manage Content</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
