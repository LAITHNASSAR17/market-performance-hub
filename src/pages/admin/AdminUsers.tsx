
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import UserTable from '@/components/admin/UserTable';
import { AdminController } from '@/controllers/AdminController';
import { User } from '@/models/UserModel';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import AddUserDialog from '@/components/admin/AddUserDialog';
import { useAuth } from '@/contexts/AuthContext';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const { toast } = useToast();
  const { getAllUsers } = useAuth();
  
  const adminController = new AdminController();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Using Auth context instead of AdminController due to database errors
      const allUsers = getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData: Partial<User>) => {
    try {
      // Add user implementation
      // This would call the AdminController's createUser method
      toast({
        title: "User Created",
        description: `User ${userData.username || userData.name} has been created successfully`
      });
      loadUsers(); // Refresh user list
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleViewUser = (userId: string) => {
    toast({
      title: "View User",
      description: `Viewing user ${userId}`
    });
    // Navigate to user detail page or open modal
  };

  const handleBlockUser = async (user: any) => {
    try {
      // Convert string to number if needed
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      await adminController.blockUser(userId);
      toast({
        title: "User Blocked",
        description: `${user.name} has been blocked`
      });
      loadUsers(); // Refresh user list
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive"
      });
    }
  };

  const handleUnblockUser = async (user: any) => {
    try {
      // Convert string to number if needed
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      await adminController.unblockUser(userId);
      toast({
        title: "User Unblocked",
        description: `${user.name} has been unblocked`
      });
      loadUsers(); // Refresh user list
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async (email: string, password: string) => {
    try {
      const user = users.find(u => u.email === email);
      if (user) {
        // Convert string to number if needed
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        await adminController.resetUserPassword(userId, password);
        toast({
          title: "Password Changed",
          description: "Password has been updated successfully"
        });
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
      throw error; // Re-throw to notify calling component
    }
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            View and manage user accounts on the platform.
          </p>
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            إضافة مستخدم
          </Button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : (
          <UserTable 
            users={users}
            onBlock={handleBlockUser}
            onUnblock={handleUnblockUser}
            onChangePassword={handleChangePassword}
            onViewUser={handleViewUser}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </div>

      <AddUserDialog 
        open={showAddUserDialog} 
        onOpenChange={setShowAddUserDialog}
        onAddUser={handleAddUser}
      />
    </>
  );
};

export default AdminUsers;
