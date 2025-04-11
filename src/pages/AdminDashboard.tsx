
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
import { UserCheck, UserX, Search, Lock, ShieldAlert, User, Users } from 'lucide-react';
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
                {t('admin.description') || 'Manage users and system settings.'}
              </p>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-xl flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  {t('admin.stats.total') || 'Total Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-xl flex items-center">
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
                <CardTitle className="text-gray-700 text-xl flex items-center">
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
            <TabsList className="mb-6 bg-white">
              <TabsTrigger value="users" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {t('admin.tabs.users') || 'Users Management'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-0">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>{t('admin.usersTable.title') || 'Users Management'}</CardTitle>
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
                              {user.isBlocked ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleUnblockUser(user)}
                                  className="mr-2 text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <UserCheck className="mr-1 h-4 w-4" />
                                  {t('admin.unblock') || 'Unblock'}
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleBlockUser(user)}
                                  className="mr-2 text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <UserX className="mr-1 h-4 w-4" />
                                  {t('admin.block') || 'Block'}
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleOpenPasswordModal(user)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                <Lock className="mr-1 h-4 w-4" />
                                {t('admin.changePassword') || 'Change Password'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            {searchTerm 
                              ? (t('admin.noSearchResults') || 'No users match your search.')
                              : (t('admin.noUsers') || 'No users found.')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right">
                          {t('admin.totalShowing') || 'Showing'}: {filteredUsers.length} / {totalUsers}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
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
