
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import UserTable from '@/components/admin/UserTable';
import AdminLayout from '@/components/layouts/AdminLayout';
import { AdminController } from '@/controllers/AdminController';
import { User } from '@/models/UserModel'; // Import User type

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const adminController = new AdminController();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await adminController.getAllUsers();
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
    <AdminLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          View and manage user accounts on the platform.
        </p>
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
    </AdminLayout>
  );
};

export default AdminUsers;
