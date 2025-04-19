
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { hashPassword, comparePassword } from '@/utils/encryption';

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
  handleRegister: (userData: any) => Promise<void>;
  handleForgotPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSubscriptionTier: (userId: string, tier: string) => Promise<void>;
}

// Define ExtendedUser without extending User to avoid compatibility issues
export interface ExtendedUser {
  id?: string;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkBypassAuth = () => {
      const bypassAuth = localStorage.getItem('bypass_auth');
      if (bypassAuth === 'true') {
        console.log("Development mode: Using bypassed authentication");
        const devUser = localStorage.getItem('dev_mode_user');
        if (devUser) {
          try {
            const parsedUser = JSON.parse(devUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(parsedUser.isAdmin || parsedUser.role === 'admin');
          } catch (e) {
            console.error("Error parsing dev user:", e);
          }
        }
        return true;
      }
      return false;
    };

    const loadSession = async () => {
      // First check if we're in development bypass mode
      if (checkBypassAuth()) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Check if user is admin
          try {
            const { data } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            setIsAdmin(data?.role === 'admin');
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Skip this if we're in bypass mode
      if (localStorage.getItem('bypass_auth') === 'true') {
        return;
      }

      setSession(session);
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      
      // Check admin status when auth state changes
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.role === 'admin');
          })
          .catch(error => {
            console.error("Error checking admin status on auth change:", error);
          });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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
      setIsAuthenticated(true);
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
      // Check if we're in bypass mode
      if (localStorage.getItem('bypass_auth') === 'true') {
        localStorage.removeItem('bypass_auth');
        localStorage.removeItem('dev_mode_user');
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }

      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
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

  // Add the missing functions to align with interface
  const handleRegister = async (userData: any) => {
    return signUp(userData);
  };

  const login = async (email: string, password: string) => {
    return signIn({ email, password });
  };

  const logout = async () => {
    return signOut();
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Forgot password error', error.message);
      throw error;
    }
  };

  const updateSubscriptionTier = async (userId: string, tier: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local users list if user being updated is in the list
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, subscription_tier: tier } : u
        )
      );
      
      // Update local user if it's the current user
      if (user?.id === userId) {
        setUser(prevUser => prevUser ? { ...prevUser, subscription_tier: tier } : null);
      }
    } catch (error: any) {
      console.error('Update subscription tier error', error.message);
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
    updatePassword,
    handleRegister,
    handleForgotPassword,
    isAuthenticated,
    isLoading: loading,
    isAdmin,
    login,
    logout,
    updateSubscriptionTier
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
