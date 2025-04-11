
import React, { useState } from 'react';
import { Search, Lock, UserCheck, UserX, Eye, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserTableProps {
  users: any[];
  onBlock: (user: any) => void;
  onUnblock: (user: any) => void;
  onChangePassword: (email: string, password: string) => Promise<void>;
  onViewUser: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onBlock,
  onUnblock,
  onChangePassword,
  onViewUser,
  searchTerm,
  setSearchTerm
}) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

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
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (selectedUser) {
      try {
        await onChangePassword(selectedUser.email, newPassword);
        handleClosePasswordModal();
      } catch (err) {
        setError('Failed to change password. Please try again.');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{user.id.substring(0, 5)}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {user.isAdmin ? 'Admin' : 'Basic'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive">
                        Blocked
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500">
                        Active
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
                        onClick={() => onViewUser(user.id)}
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 h-8 w-8 p-0"
                        title="Send Message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      {user.isBlocked ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onUnblock(user)}
                          className="text-green-600 border-green-600 hover:bg-green-50 h-8 w-8 p-0"
                          title="Unblock User"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onBlock(user)}
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
                    ? "No users match your search."
                    : "No users found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-right">
                Showing: {filteredUsers.length} / {users.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {selectedUser?.email}.
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
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                className="col-span-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePasswordModal}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} className="bg-purple-600 hover:bg-purple-700">
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTable;
