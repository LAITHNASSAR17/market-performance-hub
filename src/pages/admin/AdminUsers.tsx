
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/utils/encryption';
import { ProfileType, createProfileObject } from '@/types/database';

const AdminUsers: React.FC = () => {
  const { getAllUsers } = useAuth();
  const [users, setUsers] = useState<ProfileType[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [getAllUsers]);
  
  const handleAddUser = async (userData: { name: string; email: string; password: string; isAdmin: boolean }) => {
    try {
      const hashedPassword = hashPassword(userData.password);
      
      const profileData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.isAdmin ? 'admin' : 'user',
        is_admin: userData.isAdmin,
        is_blocked: false,
        subscription_tier: 'free',
        email_verified: true
      };
      
      const { error } = await supabase
        .from('profiles')
        .insert(profileData);
      
      if (error) throw new Error(error.message);
      
      // Refresh the user list
      await getAllUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p>This is a placeholder for the AdminUsers page.</p>
        <p>Total users: {users.length}</p>
      </div>
    </div>
  );
};

export default AdminUsers;
