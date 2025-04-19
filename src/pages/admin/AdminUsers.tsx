import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UserTable from '@/components/admin/UserTable';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/utils/encryption';

const AdminUsers: React.FC = () => {
  const { users, getAllUsers, blockUser, unblockUser, changePassword, updateUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      await getAllUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (userId: string) => {
    toast({
      title: "View User",
      description: `Loading user ${userId}`
    });
  };

  const handleBlockUser = async (user: any) => {
    try {
      await blockUser({...user, password: '' });
      toast({
        title: "User Blocked",
        description: `User ${user.name} has been blocked`
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error Blocking User",
        description: "Failed to block user",
        variant: "destructive"
      });
    }
  };

  const handleUnblockUser = async (user: any) => {
    try {
      await unblockUser(user);
      toast({
        title: "User Unblocked",
        description: `User ${user.name} has been unblocked`
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error Unblocking User",
        description: "Failed to unblock user",
        variant: "destructive"
      });
    }
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
        title: isAdmin ? "User Promoted" : "User Role Downgraded",
        description: isAdmin 
          ? `User ${user.name} has been promoted to admin` 
          : `User ${user.name} has had admin privileges removed`
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error Updating Role",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async (userData: { name: string, email: string, password: string, isAdmin: boolean }) => {
    try {
      const hashedPassword = hashPassword(userData.password);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.isAdmin ? 'admin' : 'user',
          is_blocked: false,
          subscription_tier: 'free'
        })
        .select();
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "User Added",
        description: `User ${userData.name} has been added to the system`
      });
      
      fetchUsers();
      
      return;
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error Adding User",
        description: "Failed to add new user",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Manage Users
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          View and manage user accounts on the platform.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
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
      </div>
    </div>
  );
};

export default AdminUsers;
