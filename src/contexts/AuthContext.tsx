
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (access_token: string, new_password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>; // For backward compatibility
  isAdmin: boolean; // For layout components
  users?: User[]; // Admin functionality
  getAllUsers?: () => Promise<void>; // Admin functionality
  blockUser?: (user: User) => Promise<void>; // Admin functionality
  unblockUser?: (user: User) => Promise<void>; // Admin functionality
  changePassword?: (userId: string, newPassword: string) => Promise<void>; // Admin functionality
  updateUser?: (user: User) => Promise<void>; // Admin functionality
}

const AuthContext = createContext<UserContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Check for user session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          // Get user metadata
          const userInfo = {
            id: session.user.id,
            name: session.user.user_metadata?.name || '',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'user',
            isAdmin: session.user.user_metadata?.isAdmin || false,
            isBlocked: session.user.user_metadata?.isBlocked || false,
            subscription_tier: session.user.user_metadata?.subscription_tier || 'free',
            country: session.user.user_metadata?.country,
          };
          
          setUser(userInfo);
          setIsAdmin(!!userInfo.isAdmin);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Session error:', error);
        setError('Failed to get user session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Get user data on sign in
        const userInfo = {
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          isAdmin: session.user.user_metadata?.isAdmin || false,
          isBlocked: session.user.user_metadata?.isBlocked || false,
          subscription_tier: session.user.user_metadata?.subscription_tier || 'free',
          country: session.user.user_metadata?.country,
        };
        
        setUser(userInfo);
        setIsAdmin(!!userInfo.isAdmin);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: userData.name,
            role: 'user',
            isAdmin: false,
            isBlocked: false,
            subscription_tier: 'free'
          }
        }
      });
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Please check your email to confirm your account",
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Alias for signOut to maintain compatibility with existing code
  const logout = signOut;

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password reset link sent to your email",
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (access_token: string, new_password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: new_password
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password has been reset successfully",
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        // Update user info from session metadata
        const userInfo = {
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          isAdmin: session.user.user_metadata?.isAdmin || false,
          isBlocked: session.user.user_metadata?.isBlocked || false,
          subscription_tier: session.user.user_metadata?.subscription_tier || 'free',
          country: session.user.user_metadata?.country,
        };
        
        setUser(userInfo);
        setIsAdmin(!!userInfo.isAdmin);
      }
    } catch (error: any) {
      console.error('Refresh user error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const getAllUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      // This should be replaced with an RPC call or a cloud function
      // since direct user access is usually restricted
      const { data, error } = await supabase.functions.invoke('get-all-users');
      
      if (error) throw error;
      
      if (data) {
        setUsers(data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userToBlock: User) => {
    if (!isAdmin) return;
    
    try {
      // Implement blocking logic through a secure RPC or function
      const { error } = await supabase.functions.invoke('block-user', {
        body: { userId: userToBlock.id }
      });
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userToBlock.id ? {...u, isBlocked: true} : u));
      
      toast({
        title: "Success",
        description: `User ${userToBlock.name} blocked successfully`,
      });
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive"
      });
    }
  };

  const unblockUser = async (userToUnblock: User) => {
    if (!isAdmin) return;
    
    try {
      // Implement unblocking logic through a secure RPC or function
      const { error } = await supabase.functions.invoke('unblock-user', {
        body: { userId: userToUnblock.id }
      });
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userToUnblock.id ? {...u, isBlocked: false} : u));
      
      toast({
        title: "Success",
        description: `User ${userToUnblock.name} unblocked successfully`,
      });
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive"
      });
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    if (!isAdmin) return;
    
    try {
      // Implement password change logic through a secure RPC or function
      const { error } = await supabase.functions.invoke('admin-change-password', {
        body: { userId, newPassword }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
    }
  };

  const updateUser = async (userToUpdate: User) => {
    if (!isAdmin && userToUpdate.id !== user?.id) return;
    
    try {
      // Implement user update logic through a secure RPC or function
      const { error } = await supabase.functions.invoke('update-user', {
        body: { user: userToUpdate }
      });
      
      if (error) throw error;
      
      if (isAdmin) {
        setUsers(users.map(u => u.id === userToUpdate.id ? userToUpdate : u));
      }
      
      if (userToUpdate.id === user?.id) {
        setUser(userToUpdate);
        setIsAdmin(!!userToUpdate.isAdmin);
      }
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      signIn, 
      signUp, 
      signOut, 
      forgotPassword, 
      resetPassword,
      refreshUser,
      logout,
      isAdmin,
      users,
      getAllUsers,
      blockUser,
      unblockUser,
      changePassword,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
