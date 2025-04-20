import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UserTable from '@/components/admin/UserTable';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/utils/encryption';
import { User } from '@/types/settings';

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
      await getAllUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات المستخدمين، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (userId: string) => {
    toast({
      title: "عرض المستخدم",
      description: `جاري عرض بيانات المستخدم ${userId}`
    });
  };

  const handleBlockUser = async (user: any) => {
    try {
      await blockUser({...user, password: '' });
      toast({
        title: "تم حظر المستخدم",
        description: `تم حظر ${user.name} بنجاح`
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "خطأ في حظر المستخدم",
        description: "تعذر حظر المستخدم، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const handleUnblockUser = async (user: any) => {
    try {
      await unblockUser(user);
      toast({
        title: "تم إلغاء الحظر",
        description: `تم إلغاء حظر ${user.name} بنجاح`
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "خطأ في إلغاء الحظر",
        description: "تعذر إلغاء حظر المستخدم، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const handleSetAdminRole = async (user: any, isAdmin: boolean) => {
    try {
      const updatedUser = {
        ...user,
        role: isAdmin ? 'admin' : 'user',
        isAdmin: isAdmin,
        is_admin: isAdmin
      };

      await updateUser(updatedUser);
      
      toast({
        title: isAdmin ? "تمت الترقية بنجاح" : "تم تخفيض الصلاحية بنجاح",
        description: isAdmin 
          ? `تم منح ${user.name} صلاحيات الأدمن بنجاح` 
          : `تم إزالة صلاحيات الأدمن من ${user.name} بنجاح`
      });
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "خطأ في تحديث الصلاحيات",
        description: "تعذر تحديث صلاحيات المستخدم، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async (userData: { name: string, email: string, password: string, isAdmin: boolean }) => {
    try {
      // Create a user in the profiles table - we need to generate a unique ID
      const newUserId = crypto.randomUUID();
      
      // Create a new user in profiles table
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          name: userData.name,
          email: userData.email,
          role: userData.isAdmin ? 'admin' : 'user',
          is_admin: userData.isAdmin,
          is_blocked: false,
          subscription_tier: 'free'
        });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "تم إضافة المستخدم بنجاح",
        description: `تم إضافة ${userData.name} إلى النظام بنجاح`
      });
      
      // Refresh users list
      fetchUsers();
      
      return;
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "خطأ في إضافة المستخدم",
        description: "تعذر إضافة المستخدم الجديد، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      throw error; // Rethrow for the component to handle
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          إدارة المستخدمين
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          عرض وإدارة حسابات المستخدمين على المنصة.
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
