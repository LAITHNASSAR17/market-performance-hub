import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

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
  sendPasswordResetEmail: (email: string) => Promise<any>;
  register: (email: string, password: string, name: string) => Promise<any>;
  loading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for active session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'User',
          email: session.user.email || '',
          isAdmin: session.user.user_metadata?.isAdmin || false,
          role: session.user.user_metadata?.role || 'user',
          subscription_tier: session.user.user_metadata?.subscription_tier || 'free'
        });
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      // Since we don't have direct access to auth.users, we'll simulate this
      // In a real application, you would use a cloud function or server-side logic
      // to retrieve users from auth.users
      
      // For simulation purposes, we're returning the stored users or mock data
      if (users.length > 0) {
        return users;
      }
      
      // Fetch from a users profile table if it exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (!error && data) {
        const formattedUsers: User[] = data.map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email || '',
          role: u.role || 'user',
          isAdmin: u.is_admin || false,
          isBlocked: u.is_blocked || false,
          subscription_tier: u.subscription_tier || 'free'
        }));
        
        setUsers(formattedUsers);
        return formattedUsers;
      }
        
      // If no data, return a mock list for development
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          isAdmin: true,
          isBlocked: false,
          subscription_tier: 'premium'
        },
        {
          id: '2',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
          isAdmin: false,
          isBlocked: false,
          subscription_tier: 'free'
        }
      ];
      
      setUsers(mockUsers);
      return mockUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        setIsAuthenticated(true);
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || 'User',
          email: data.user.email || '',
          isAdmin: data.user.user_metadata?.isAdmin || false,
          role: data.user.user_metadata?.role || 'user',
          subscription_tier: data.user.user_metadata?.subscription_tier || 'free'
        });
      }

      return data;
    } catch (error) {
      console.error('Error during login:', error);
      toast({
        title: "Login Error",
        description: "Invalid email or password",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin: false,
            role: 'user',
            subscription_tier: 'free'
          }
        }
      });

      if (error) throw error;

      // Don't automatically log in since email verification may be required
      toast({
        title: "Registration Success",
        description: "Please check your email to verify your account",
      });

      return data;
    } catch (error) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration Error",
        description: "Failed to register account",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update user metadata in auth
      const { error } = await supabase.auth.updateUser({
        data: userData
      });

      if (error) throw error;

      // Update local user state
      setUser({ ...user, ...userData });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      throw error;
    }
  };

  const blockUser = async (user: User) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user, isBlocked: true } }
      );

      if (error) throw error;

      await getAllUsers();
      toast({
        title: "Success",
        description: "User blocked successfully",
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive"
      });
    }
  };

  const unblockUser = async (user: User) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user, isBlocked: false } }
      );

      if (error) throw error;

      await getAllUsers();
      toast({
        title: "Success",
        description: "User unblocked successfully",
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive"
      });
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        updatedUser.id,
        { user_metadata: updatedUser }
      );

      if (error) throw error;

      await getAllUsers();
      
      // Update current user if it's the same
      if (user?.id === updatedUser.id) {
        setUser(updatedUser);
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
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
        updateUser,
        sendPasswordResetEmail,
        register,
        loading,
        updateProfile
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
