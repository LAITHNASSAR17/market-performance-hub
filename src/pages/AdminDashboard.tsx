
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
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
  ArrowUpRight, 
  RefreshCw
} from 'lucide-react';
import Layout from '@/components/Layout';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, users, getAllUsers, blockUser, unblockUser, changePassword } = useAuth();
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Filter users when search term changes
    if (users) {
      setFilteredUsers(
        users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, users]);

  const handleRefreshData = () => {
    const refreshedUsers = getAllUsers();
    setFilteredUsers(
      refreshedUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setLastRefresh(new Date());
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleBlockUser = (user: any) => {
    blockUser({...user, password: '' });
    setSelectedUser(null);
  };

  const handleUnblockUser = (user: any) => {
    unblockUser(user);
    setSelectedUser(null);
  };

  const handleOpenPasswordModal = (user: any) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setNewPassword('');
    setError('');
    setSelectedUser(null);
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      setError(t('admin.error.emptyPassword') || 'Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError(t('admin.error.passwordLength') || 'Password must be at least 6 characters long.');
      return;
    }

    if (selectedUser) {
      try {
        await changePassword(selectedUser.email, newPassword);
        handleClosePasswordModal();
      } catch (err) {
        setError(t('admin.error.changePassword') || 'Failed to change password. Please try again.');
      }
    }
  };

  const activeUsers = users ? users.filter(user => !user.isBlocked).length : 0;
  const blockedUsers = users ? users.filter(user => user.isBlocked).length : 0;
  const totalUsers = users ? users.length : 0;

  // Mock data for statistics
  const stats = {
    linkedAccounts: 12,
    totalTrades: 453,
    profitLoss: '$3,248.75',
    totalNotes: 87,
    mostTradedPair: 'EUR/USD',
    todayTrades: 23,
    todayProfit: '$148.32'
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShieldAlert className="mr-2 h-8 w-8 text-purple-600" />
                {t('admin.title') || 'Admin Dashboard'}
              </h1>
              <p className="mt-1 text-gray-500">
                {t('admin.description') || 'Manage users, trades, and system settings.'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-500">
              <span>Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshData}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Data
              </Button>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  {t('admin.stats.total') || 'Total Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
                  <p className="text-sm text-gray-500">
                    Active: <span className="text-green-600 font-semibold">{activeUsers}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
                  {t('admin.stats.tradingAccounts') || 'Trading Accounts'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-600">{stats.linkedAccounts}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-emerald-600" />
                  {t('admin.stats.trades') || 'Total Trades'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-bold text-emerald-600">{stats.totalTrades}</p>
                  <p className="text-sm text-gray-500">
                    Today: <span className="font-semibold">{stats.todayTrades}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                  {t('admin.stats.profit') || 'Total Profit/Loss'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-bold text-green-600">{stats.profitLoss}</p>
                  <p className="text-sm text-gray-500">
                    Today: <span className="font-semibold">{stats.todayProfit}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-amber-600" />
                  {t('admin.stats.notes') || 'Total Notes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-600">{stats.totalNotes}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-pink-600" />
                  {t('admin.stats.popularPair') || 'Most Traded Pair'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-pink-600">{stats.mostTradedPair}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-green-600" />
                  {t('admin.stats.active') || 'Active Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-lg flex items-center">
                  <UserX className="mr-2 h-5 w-5 text-red-600" />
                  {t('admin.stats.blocked') || 'Blocked Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{blockedUsers}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-6 bg-white p-1 rounded-md">
              <TabsTrigger value="users" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {t('admin.tabs.users') || 'User Management'}
              </TabsTrigger>
              <TabsTrigger value="trades" className="flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                {t('admin.tabs.trades') || 'Trade Management'}
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                {t('admin.tabs.hashtags') || 'Hashtag Management'}
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {t('admin.tabs.notes') || 'Notes Management'}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                {t('admin.tabs.settings') || 'System Settings'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>{t('admin.usersTable.title') || 'User Management'}</CardTitle>
                  <CardDescription>{t('admin.usersTable.description') || 'View and manage user accounts.'}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex mb-4">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 pr-4"
                        placeholder={t('admin.search') || 'Search users...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">{t('admin.id') || 'ID'}</TableHead>
                        <TableHead>{t('admin.name') || 'Name'}</TableHead>
                        <TableHead>{t('admin.email') || 'Email'}</TableHead>
                        <TableHead>{t('admin.subscription') || 'Subscription'}</TableHead>
                        <TableHead>{t('admin.status') || 'Status'}</TableHead>
                        <TableHead className="text-right">{t('admin.actions') || 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{user.id.substring(0, 5)}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {user.isAdmin ? 'Admin' : 'Basic'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.isBlocked ? (
                                <Badge variant="destructive">
                                  {t('admin.status.blocked') || 'Blocked'}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-500">
                                  {t('admin.status.active') || 'Active'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                                  title="View User"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleOpenPasswordModal(user)}
                                  className="text-amber-600 border-amber-600 hover:bg-amber-50 h-8 w-8 p-0"
                                  title="Change Password"
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                                {user.isBlocked ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleUnblockUser(user)}
                                    className="text-green-600 border-green-600 hover:bg-green-50 h-8 w-8 p-0"
                                    title="Unblock User"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleBlockUser(user)}
                                    className="text-red-600 border-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                    title="Block User"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {searchTerm 
                              ? (t('admin.noSearchResults') || 'No users match your search.')
                              : (t('admin.noUsers') || 'No users found.')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={6} className="text-right">
                          {t('admin.totalShowing') || 'Showing'}: {filteredUsers.length} / {totalUsers}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
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
                  <div className="flex flex-col sm:flex-row mb-4 gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 pr-4"
                        placeholder="Search trades..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <FileUp className="mr-1 h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm" className="flex items-center">
                        <RefreshCw className="mr-1 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Pair</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>P/L</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No trades available. Trades will appear here once users start adding them.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
                  <div className="flex flex-col sm:flex-row mb-4 gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 pr-4"
                        placeholder="Search hashtags..."
                      />
                    </div>
                    <Button size="sm" className="flex items-center">
                      <Hash className="mr-1 h-4 w-4" />
                      Add New Hashtag
                    </Button>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hashtag</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No hashtags found. Hashtags will appear here once users start using them in trades or notes.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No notes found. Notes will appear here once users start creating them.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage general system settings</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input id="siteName" defaultValue="Trading Journal Platform" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Site Description</Label>
                      <Input id="description" defaultValue="Track your trading journey and improve your performance" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowRegistration">Allow User Registration</Label>
                        <p className="text-sm text-gray-500">Enable or disable new user registration</p>
                      </div>
                      <Switch id="allowRegistration" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">Put site in maintenance mode</p>
                      </div>
                      <Switch id="maintenanceMode" />
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button className="w-full">Save Settings</Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure notification system</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Send notifications via email</p>
                      </div>
                      <Switch id="emailNotifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                        <p className="text-sm text-gray-500">Show notifications in-app</p>
                      </div>
                      <Switch id="inAppNotifications" defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="welcomeMessage">Welcome Message</Label>
                      <Input id="welcomeMessage" defaultValue="Welcome to our Trading Journal Platform!" />
                    </div>
                    
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <Bell className="mr-2 h-4 w-4" />
                        Send Test Notification
                      </Button>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button className="w-full">Save Notification Settings</Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-white shadow-sm md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle>Backup & Export</CardTitle>
                    <CardDescription>Create and manage system backups</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="flex items-center justify-center">
                        <FileUp className="mr-2 h-4 w-4" />
                        Export All Users
                      </Button>
                      <Button variant="outline" className="flex items-center justify-center">
                        <FileUp className="mr-2 h-4 w-4" />
                        Export All Trades
                      </Button>
                      <Button variant="outline" className="flex items-center justify-center">
                        <FileUp className="mr-2 h-4 w-4" />
                        Export All Notes
                      </Button>
                    </div>
                    
                    <div className="pt-4">
                      <Button className="w-full md:w-auto" variant="default">
                        Create Full System Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('admin.modal.title') || 'Change Password'}</DialogTitle>
              <DialogDescription>
                {t('admin.modal.description') || 'Enter a new password for'} {selectedUser?.email}.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  {t('admin.modal.newPassword') || 'New Password'}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder={t('admin.modal.enterPassword') || 'Enter new password'}
                  className="col-span-3"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClosePasswordModal}>
                {t('admin.modal.cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleChangePassword} className="bg-purple-600 hover:bg-purple-700">
                <Lock className="mr-2 h-4 w-4" />
                {t('admin.modal.confirm') || 'Change Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
