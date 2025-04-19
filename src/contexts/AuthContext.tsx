
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/settings';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  blockUser: (user: User) => Promise<void>;
  unblockUser: (user: User) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for now
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    isAdmin: true
  });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // For demo purposes, set demo user data
    if (!user) {
      setUser({
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        isAdmin: true
      });
    }
  }, []);

  // Get all admin users
  const getAllUsers = async (): Promise<User[]> => {
    try {
      // In a real app, we'd fetch from the users table
      // For demo, return hardcoded data
      const demoUsers = [
        {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin',
          isAdmin: true,
          isBlocked: false
        },
        {
          id: '2',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
          isAdmin: false,
          isBlocked: false
        }
      ];
      
      setUsers(demoUsers);
      return demoUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const login = async (email: string, password: string) => {
    // Demo login - in real app we'd use supabase auth
    setIsAuthenticated(true);
    setUser({
      id: '1',
      name: 'Demo User',
      email: email,
      isAdmin: true
    });
    return { user: { id: '1' } };
  };

  const logout = async () => {
    // Demo logout
    setIsAuthenticated(false);
    setUser(null);
  };

  const blockUser = async (user: User) => {
    // Demo implementation
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === user.id ? { ...u, isBlocked: true } : u
      )
    );
  };

  const unblockUser = async (user: User) => {
    // Demo implementation
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === user.id ? { ...u, isBlocked: false } : u
      )
    );
  };

  const changePassword = async (userId: string, newPassword: string) => {
    // Demo implementation
    console.log(`Changed password for user ${userId} to ${newPassword}`);
  };

  const updateUser = async (updatedUser: User) => {
    // Demo implementation
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      )
    );
  };

  const isAdmin = user?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isAdmin,
        users,
        login,
        logout,
        getAllUsers,
        blockUser,
        unblockUser,
        changePassword,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
