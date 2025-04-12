
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UserTable from '@/components/admin/UserTable';

const AdminUsers: React.FC = () => {
  const { users, getAllUsers, blockUser, unblockUser, changePassword } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleViewUser = (userId: string) => {
    toast({
      title: "View User",
      description: `Viewing user ${userId}`
    });
  };

  const handleBlockUser = (user: any) => {
    blockUser({...user, password: '' });
    toast({
      title: "User Blocked",
      description: `${user.name} has been blocked`
    });
  };

  const handleUnblockUser = (user: any) => {
    unblockUser(user);
    toast({
      title: "User Unblocked",
      description: `${user.name} has been unblocked`
    });
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          User Management
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
