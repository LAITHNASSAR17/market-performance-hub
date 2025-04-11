
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrade } from '@/contexts/TradeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AlertCircle, Ban, Search, Shield, UserCog, Users, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, getAllUsers, deleteUser, blockUser, unblockUser, updateSystemSettings, getSystemSettings } = useAuth();
  const { trades } = useTrade();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [userToToggleBlock, setUserToToggleBlock] = useState<{id: string, isBlocked: boolean} | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [platformName, setPlatformName] = useState(getSystemSettings().platformName);
  const [supportEmail, setSupportEmail] = useState(getSystemSettings().supportEmail);
  const [passwordPolicy, setPasswordPolicy] = useState(getSystemSettings().passwordPolicy);
  const [sessionTimeout, setSessionTimeout] = useState(getSystemSettings().sessionTimeout.toString());
  
  // Redirect to dashboard if not admin
  if (!isAdmin) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You do not have permission to access the admin dashboard",
    });
    navigate('/dashboard');
    return null;
  }

  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userTradeStats = allUsers.map(user => {
    const userTrades = trades.filter(trade => trade.userId === user.id);
    const totalTrades = userTrades.length;
    const totalProfit = userTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const winningTrades = userTrades.filter(trade => trade.profitLoss > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    return {
      userId: user.id,
      totalTrades,
      totalProfit,
      winRate
    };
  });

  const getTradingStats = (userId: string) => {
    return userTradeStats.find(stats => stats.userId === userId) || {
      totalTrades: 0,
      totalProfit: 0,
      winRate: 0
    };
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleToggleBlockUser = (userId: string, isCurrentlyBlocked: boolean) => {
    setUserToToggleBlock({ id: userId, isBlocked: isCurrentlyBlocked });
    setIsBlockDialogOpen(true);
  };

  const confirmToggleBlockUser = () => {
    if (userToToggleBlock) {
      if (userToToggleBlock.isBlocked) {
        unblockUser(userToToggleBlock.id);
      } else {
        blockUser(userToToggleBlock.id);
      }
      setIsBlockDialogOpen(false);
      setUserToToggleBlock(null);
    }
  };

  const handleSaveSettings = () => {
    updateSystemSettings({
      platformName,
      supportEmail,
      passwordPolicy,
      sessionTimeout: parseInt(sessionTimeout)
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <UserCog className="mr-2 h-6 w-6" />
          Admin Dashboard
        </h1>
        <p className="text-gray-500">Manage users and system settings</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Key metrics about your trading platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Users</p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Trades</p>
                <p className="text-2xl font-bold">{trades.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Platform Profit</p>
                <p className="text-2xl font-bold">${trades.reduce((sum, trade) => sum + trade.profitLoss, 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="trades">Trading Activity</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>All Users</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trades</TableHead>
                      <TableHead>Total P&L</TableHead>
                      <TableHead>Win Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const stats = getTradingStats(user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge variant="default" className="bg-purple-500">Admin</Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isBlocked ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-500">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>{stats.totalTrades}</TableCell>
                          <TableCell className={stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            ${stats.totalProfit.toFixed(2)}
                          </TableCell>
                          <TableCell>{stats.winRate.toFixed(0)}%</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">View</Button>
                              {!user.isAdmin && (
                                <>
                                  <Button 
                                    variant={user.isBlocked ? "default" : "secondary"} 
                                    size="sm"
                                    onClick={() => handleToggleBlockUser(user.id, !!user.isBlocked)}
                                  >
                                    {user.isBlocked ? "Unblock" : "Block"}
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center text-gray-500">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>Trading Activity</CardTitle>
              <CardDescription>Monitor all platform trades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Pair</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Profit/Loss</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.slice(0, 10).map((trade) => {
                      const tradeUser = allUsers.find(u => u.id === trade.userId);
                      return (
                        <TableRow key={trade.id}>
                          <TableCell>{trade.date}</TableCell>
                          <TableCell>{tradeUser?.name || 'Unknown'}</TableCell>
                          <TableCell>{trade.pair}</TableCell>
                          <TableCell>{trade.type}</TableCell>
                          <TableCell className={trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                            ${trade.profitLoss.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {trades.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center text-gray-500">
                            <XCircle className="h-8 w-8 mb-2" />
                            <p>No trades found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Platform Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input 
                        id="platform-name" 
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform-email">Support Email</Label>
                      <Input 
                        id="platform-email" 
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Security Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-policy">Password Policy</Label>
                      <Select 
                        value={passwordPolicy} 
                        onValueChange={setPasswordPolicy}
                      >
                        <SelectTrigger id="password-policy">
                          <SelectValue placeholder="Select password policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (min 6 characters)</SelectItem>
                          <SelectItem value="medium">Medium (min 8 characters, 1 number)</SelectItem>
                          <SelectItem value="high">High (min 10 characters, mixed case, numbers, symbols)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="session-timeout" 
                        type="number" 
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full md:w-auto" onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock User Confirmation Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userToToggleBlock?.isBlocked ? "Confirm Unblock User" : "Confirm Block User"}
            </DialogTitle>
            <DialogDescription>
              {userToToggleBlock?.isBlocked 
                ? "Are you sure you want to unblock this user? They will be able to log in again."
                : "Are you sure you want to block this user? They will not be able to log in until unblocked."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={userToToggleBlock?.isBlocked ? "default" : "destructive"} 
              onClick={confirmToggleBlockUser}
            >
              {userToToggleBlock?.isBlocked ? "Unblock" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
