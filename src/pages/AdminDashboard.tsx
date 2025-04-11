
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useLanguage } from '@/contexts/LanguageContext';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, users, getAllUsers, blockUser, unblockUser, changePassword } = useAuth();
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  // No need to call getAllUsers here as it's now handled in the AuthContext

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

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.title') || 'Admin Dashboard'}</CardTitle>
          <CardDescription>{t('admin.description') || 'Manage users and system settings.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>{t('admin.tableCaption') || 'A list of all registered users.'}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('admin.id') || 'ID'}</TableHead>
                <TableHead>{t('admin.name') || 'Name'}</TableHead>
                <TableHead>{t('admin.email') || 'Email'}</TableHead>
                <TableHead>{t('admin.status') || 'Status'}</TableHead>
                <TableHead className="text-right">{t('admin.actions') || 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isBlocked 
                      ? (t('admin.status.blocked') || 'Blocked') 
                      : (t('admin.status.active') || 'Active')}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.isBlocked ? (
                      <Button variant="ghost" size="sm" onClick={() => handleUnblockUser(user)}>
                        {t('admin.unblock') || 'Unblock'}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleBlockUser(user)}>
                        {t('admin.block') || 'Block'}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleOpenPasswordModal(user)}>
                      {t('admin.changePassword') || 'Change Password'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
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
            <Button variant="secondary" onClick={handleClosePasswordModal}>
              {t('admin.modal.cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleChangePassword}>
              {t('admin.modal.confirm') || 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
