
import React, { useState } from 'react';
import { Search, UserCheck, UserX, User as UserIcon, Eye, X, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import UserPerformance from './UserPerformance';

interface UserTableProps {
  users: any[];
  onBlock: (user: any) => void;
  onUnblock: (user: any) => void;
  onChangePassword: (email: string, newPassword: string) => Promise<void>;
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
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.id && user.id.toLowerCase().includes(searchLower))
    );
  });

  const handlePasswordReset = async () => {
    if (resetPasswordUserId) {
      const user = users.find(u => u.id === resetPasswordUserId);
      if (user && user.email) {
        await onChangePassword(user.email, newPassword);
        setNewPassword('');
        setResetPasswordUserId(null);
      }
    }
  };

  const openResetPasswordDialog = (userId: string) => {
    setResetPasswordUserId(userId);
    setNewPassword('');
  };

  const closeResetPasswordDialog = () => {
    setResetPasswordUserId(null);
    setNewPassword('');
  };

  const viewUserPerformance = (user: any) => {
    setSelectedUser(user);
    setShowPerformance(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row mb-4 gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>List of all registered users on the platform</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                    {user.isAdmin ? (
                      <Badge className="bg-purple-500">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.isBlocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => viewUserPerformance(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.isBlocked ? (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onUnblock(user)}
                          className="text-green-600"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onBlock(user)}
                          className="text-red-600"
                          disabled={user.isAdmin}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openResetPasswordDialog(user.id)}
                          >
                            Reset Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                              Enter a new password for {user.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="newPassword" className="text-sm font-medium">
                                New Password
                              </label>
                              <Input
                                id="newPassword"
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={closeResetPasswordDialog}>
                              Cancel
                            </Button>
                            <Button onClick={handlePasswordReset}>
                              Reset Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Performance Dialog */}
      <Dialog open={showPerformance} onOpenChange={setShowPerformance}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Performance</DialogTitle>
            <DialogDescription>
              Detailed trading performance for this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <UserPerformance userId={selectedUser.id} userName={selectedUser.name} />
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowPerformance(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTable;
