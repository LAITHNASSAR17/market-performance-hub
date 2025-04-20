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
  Eye, 
  Edit, 
  Trash2, 
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
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/utils/encryption';
import { createProfileObject } from '@/types/database';

interface Hashtag {
  name: string;
  count: number;
  addedBy: string;
  lastUsed: string;
}

const sampleHashtagsData: Hashtag[] = [
  { name: 'trading', count: 145, addedBy: 'Admin', lastUsed: '2023-08-15' },
  { name: 'forex', count: 87, addedBy: 'Admin', lastUsed: '2023-08-14' },
  { name: 'crypto', count: 56, addedBy: 'Admin', lastUsed: '2023-08-12' },
  { name: 'stocks', count: 42, addedBy: 'ModeratorUser', lastUsed: '2023-08-10' },
];

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, users, getAllUsers, blockUser, unblockUser, changePassword, updateUser } = useAuth();
  const { trades, getAllTrades, deleteTrade } = useTrade();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hashtags, setHashtags] = useState<Hashtag[]>(sampleHashtagsData);
  const [allTrades, setAllTrades] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      handleRefreshData();
    }
  }, [isAdmin]);

  const totalUsers = users ? users.length : 0;
  const activeUsers = users ? users.filter(user => !user.isBlocked).length : 0;
  const blockedUsers = users ? users.filter(user => user.isBlocked).length : 0;
  
  const totalTrades = allTrades.length;
  
  const allProfitLoss = allTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  
  const winningTrades = allTrades.filter(trade => (trade.profitLoss || 0) > 0).length;
  const losingTrades = allTrades.filter(trade => (trade.profitLoss || 0) < 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = allTrades.filter(trade => trade.date === today).length;
  const todayProfit = allTrades
    .filter(trade => trade.date === today)
    .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  
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

  const linkedAccounts = 12;
  const totalNotes = 87;

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleRefreshData = () => {
    getAllUsers();
    
    const allTradesData = trades || [];
    setAllTrades(allTradesData);
    
    setLastRefresh(new Date());
    
    toast({
      title: "Data Refreshed",
      description: "Admin dashboard data has been updated"
    });
  };

  const handleBlockUser = (user: any) => {
    blockUser({...user, password: '' });
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

  const handleSetAdminRole = async (user: any, isAdmin: boolean) => {
    try {
      const updatedUser = {
        ...user,
        role: isAdmin ? 'admin' : 'user',
        isAdmin: isAdmin
      };

      await updateUser(updatedUser);
      
      toast({
        title: isAdmin ? "User promoted" : "User demoted",
        description: isAdmin 
          ? `${user.name} has been granted admin privileges` 
          : `${user.name} admin privileges have been revoked`
      });
      
      getAllUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating user role",
        description: "Failed to update user role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async (userData: { name: string, email: string, password: string, isAdmin: boolean }) => {
    try {
      const hashedPassword = hashPassword(userData.password);
      
      const profileData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.isAdmin ? 'admin' : 'user',
        is_admin: userData.isAdmin,
        is_blocked: false,
        subscription_tier: 'free',
        email_verified: true
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "User Added",
        description: `${userData.name} has been added successfully`
      });
      
      getAllUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error Adding User",
        description: "Failed to add new user. Please try again.",
        variant: "destructive"
      });
      throw error; // Rethrow for the component to handle
    }
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
  };

  const handleEditTrade = (id: string) => {
    toast({
      title: "Edit Trade",
      description: `Editing trade ${id}`
    });
  };

  const handleDeleteTrade = (id: string) => {
    deleteTrade(id);
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
  };

  const handleViewUser = (userId: string) => {
    toast({
      title: "View User",
      description: `Viewing user ${userId}`
    });
  };

  const AdminCharts: React.FC<{ className?: string }> = ({ className }) => (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Admin Charts</CardTitle>
          <CardDescription>Analytics charts will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Charts Coming Soon</h3>
            <p>The analytics charts functionality is under development and will be available in a future update.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const UserTable: React.FC<{
    users: any[];
    onBlock: (user: any) => void;
    onUnblock: (user: any) => void;
    onChangePassword: (email: string, newPassword: string) => Promise<void>;
    onViewUser: (userId: string) => void;
    onSetAdmin: (user: any, isAdmin: boolean) => void;
    onAddUser: (userData: any) => Promise<void>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  }> = (props) => (
    <div>
      <div className="text-center p-8 text-gray-500">
        <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">User Table Component</h3>
        <p>Please create the UserTable component to display user data here.</p>
      </div>
    </div>
  );

  const TradeTable: React.FC<{
    trades: any[];
    onViewTrade: (id: string) => void;
    onEditTrade: (id: string) => void;
    onDeleteTrade: (id: string) => void;
    onRefresh: () => void;
    onExport: () => void;
  }> = (props) => (
    <div>
      <div className="text-center p-8 text-gray-500">
        <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Trade Table Component</h3>
        <p>Please create the TradeTable component to display trade data here.</p>
      </div>
    </div>
  );

  const HashtagsTable: React.FC<{
    hashtags: Hashtag[];
    onAddHashtag: (name: string) => void;
    onEditHashtag: (oldName: string, newName: string) => void;
    onDeleteHashtag: (name: string) => void;
  }> = (props) => (
    <div>
      <div className="text-center p-8 text-gray-500">
        <Hash className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Hashtags Table Component</h3>
        <p>Please create the HashtagsTable component to display hashtag data here.</p>
      </div>
    </div>
  );

  const SystemSettings: React.FC = () => (
    <div>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system-wide settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500">
            <Settings className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">System Settings Component</h3>
            <p>Please create the SystemSettings component to manage system settings here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-6">
        <div className="flex flex-col space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <ShieldAlert className="mr-2 h-6 md:h-8 w-6 md:w-8 text-purple-600" />
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-500">
                Manage users, trades, and system settings.
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

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
              icon={<Activity className="h-4 md:h-5 w-4 md:w-5" />}
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
              icon={<UserX className="h-4 md:h-5 w-4 md:w-5" />}
              color="red"
              description={blockedUsers > 0 ? `${blockedUsers} of ${totalUsers}` : 'None'}
            />
          </div>

          <AdminCharts className="mt-4" />

          <Tabs defaultValue="users" className="w-full mt-6">
            <TabsList className="mb-6 bg-white p-1 rounded-md overflow-x-auto flex whitespace-nowrap">
              <TabsTrigger value="users" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="trades" className="flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Trade Management</span>
                <span className="sm:hidden">Trades</span>
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Hashtag Management</span>
                <span className="sm:hidden">Tags</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Notes Management</span>
                <span className="sm:hidden">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">System Settings</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage user accounts.</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <UserTable 
                    users={users}
                    onBlock={handleBlockUser}
                    onUnblock={handleUnblockUser}
                    onChangePassword={changePassword}
                    onViewUser={handleViewUser}
                    onSetAdmin={handleSetAdminRole}
                    onAddUser={handleAddUser}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trades" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Trade Management</CardTitle>
                  <CardDescription>View and manage all trades across the platform.</CardDescription>
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
                  <CardTitle>Hashtag Management</CardTitle>
                  <CardDescription>Manage hashtags used across the platform.</CardDescription>
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
                  <CardTitle>Notes Management</CardTitle>
                  <CardDescription>View and manage all user notes.</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col sm:flex-row mb-4 gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 pr-4"
                        placeholder="Search notes..."
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Notes Module Coming Soon</h3>
                      <p>The notes management functionality is under development and will be available in a future update.</p>
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
