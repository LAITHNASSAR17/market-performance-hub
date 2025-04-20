
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from '@/types/settings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Edit, Trash2, User as UserIcon, Ban } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, getAllUsers } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBlockingUser, setIsBlockingUser] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    } else {
      fetchAllUsers();
    }
  }, [isAdmin, navigate]);

  const fetchAllUsers = async () => {
    try {
      // Fetch users using the context method
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    
    try {
      // Filter users based on search query
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredUsers(filtered);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
      setIsSearching(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    setIsBlockingUser(true);
    try {
      // Find user to block
      const userToBlock = users.find(u => u.id === userId);
      if (!userToBlock) {
        throw new Error("User not found");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: true })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User blocked successfully",
      });
      fetchAllUsers(); // Refresh user list
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive"
      });
    } finally {
      setIsBlockingUser(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setIsBlockingUser(true);
    try {
      // Find user to unblock
      const userToUnblock = users.find(u => u.id === userId);
      if (!userToUnblock) {
        throw new Error("User not found");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unblocked successfully",
      });
      fetchAllUsers(); // Refresh user list
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unblock user",
        variant: "destructive"
      });
    } finally {
      setIsBlockingUser(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          is_admin: updatedUser.isAdmin,
          is_blocked: updatedUser.isBlocked,
          subscription_tier: updatedUser.subscription_tier,
          country: updatedUser.country
        })
        .eq('id', updatedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      fetchAllUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Note: This is likely to fail without admin privileges in production
      // Consider creating a Supabase Edge Function for this operation
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchAllUsers(); // Refresh user list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableCaption>A list of all users in your account. Click on a user to edit their profile.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role || 'User'}</TableCell>
                  <TableCell>{user.subscription_tier || 'Free'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        {user.isBlocked ? (
                          <DropdownMenuItem onClick={() => handleUnblockUser(user.id)} disabled={isBlockingUser}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            Unblock User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleBlockUser(user.id)} disabled={isBlockingUser}>
                            <Ban className="mr-2 h-4 w-4" />
                            Block User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={() => setIsEditDialogOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onUpdate={handleUpdateUser}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

interface EditUserFormProps {
  user: User;
  onUpdate: (user: User) => void;
  onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onUpdate, onCancel }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin || false);
  const [isBlocked, setIsBlocked] = useState(user.isBlocked || false);
  const [subscriptionTier, setSubscriptionTier] = useState(user.subscription_tier || '');
  const [country, setCountry] = useState(user.country || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, name, email, isAdmin, isBlocked, subscription_tier: subscriptionTier, country };
    onUpdate(updatedUser);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">Email</Label>
        <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="isAdmin" className="text-right">Admin</Label>
        <Switch id="isAdmin" checked={isAdmin} onCheckedChange={setIsAdmin} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="isBlocked" className="text-right">Blocked</Label>
        <Switch id="isBlocked" checked={isBlocked} onCheckedChange={setIsBlocked} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="subscriptionTier" className="text-right">Subscription</Label>
        <Input
          type="text"
          id="subscriptionTier"
          value={subscriptionTier}
          onChange={(e) => setSubscriptionTier(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="country" className="text-right">Country</Label>
        <Input
          type="text"
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} className="mr-2">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default AdminDashboard;
