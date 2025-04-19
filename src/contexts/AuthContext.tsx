import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { hashPassword, verifyPassword } from '@/utils/encryption';

interface AuthContextProps {
  session: Session | null;
  user: ExtendedUser | null;
  users: any[];
  loading: boolean;
  signUp: (credentials: any) => Promise<void>;
  signIn: (credentials: any) => Promise<void>;
  signOut: () => Promise<void>;
  getAllUsers: () => Promise<void>;
  blockUser: (user: any) => Promise<void>;
  unblockUser: (user: any) => Promise<void>;
  changePassword: (user: any, newPassword: string) => Promise<void>;
	updateUser: (user: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export interface ExtendedUser extends User {
  name?: string;
  email?: string;
  role?: string;
  is_blocked?: boolean;
  isAdmin?: boolean;
  subscription_tier?: string;
  created_at?: string;
  avatar_url?: string;
  updatePassword?: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    };

    loadSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });
  }, []);

  const signUp = async (credentials: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            email: credentials.email,
            role: 'user',
            is_blocked: false,
            subscription_tier: 'free'
          }
        }
      });
      if (error) throw error;
      setUser(data.user);
    } catch (error: any) {
      console.error('Signup error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      setUser(data.user);
    } catch (error: any) {
      console.error('Signin error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Signout error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Get all users error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (user: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: true })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, is_blocked: true } : u
        )
      );
    } catch (error: any) {
      console.error('Block user error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (user: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: false })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, is_blocked: false } : u
        )
      );
    } catch (error: any) {
      console.error('Unblock user error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (user: any, newPassword: string) => {
    setLoading(true);
    try {
      const hashedPassword = hashPassword(newPassword);
      
      const { error } = await supabase
        .from('profiles')
        .update({ password: hashedPassword })
        .eq('id', user.id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Change password error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updateUser = async (user: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: user.role, isAdmin: user.isAdmin })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, role: user.role, isAdmin: user.isAdmin } : u
        )
      );
    } catch (error: any) {
      console.error('Update user error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({ 
          name: data.name,
          email: data.email,
          avatar_url: data.avatar_url
         })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setUser((prevUser: any) => ({
        ...prevUser,
        ...profile,
      }));
    } catch (error: any) {
      console.error('Update profile error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      console.log('Password updated successfully', data);
    } catch (error: any) {
      console.error('Update password error', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextProps = {
    session,
    user,
    users,
    loading,
    signUp,
    signIn,
    signOut,
    getAllUsers,
    blockUser,
    unblockUser,
    changePassword,
		updateUser,
    updateProfile,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
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
