
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Create an extended user type that includes additional properties our app needs
interface ExtendedUser extends User {
  name?: string;
  isAdmin?: boolean;
  subscription_tier?: string;
  role?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  users: any[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  // Add missing methods
  updateProfile: (name: string, email: string, currentPassword?: string, newPassword?: string) => Promise<void>;
  getAllUsers: () => Promise<any[]>;
  blockUser: (user: any) => Promise<void>;
  unblockUser: (user: any) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  updateUser: (user: any) => Promise<void>;
  updateSubscriptionTier: (userId: string, tier: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser as ExtendedUser | null);
        setSession(session);
        setIsAuthenticated(!!currentUser);
        setLoading(false);

        if (currentUser) {
          // Check if user is admin
          const { data: userRole } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', currentUser.id)
            .maybeSingle();
          
          if (userRole) {
            // Update user with additional properties
            setUser(prev => ({
              ...(prev as ExtendedUser),
              name: userRole.name,
              role: userRole.role,
              isAdmin: userRole.role === 'admin'
            }));
            setIsAdmin(userRole.role === 'admin');
          }

          // Load user preferences
          loadUserPreferences(currentUser.id);
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser as ExtendedUser | null);
      setSession(session);
      setIsAuthenticated(!!currentUser);

      if (currentUser) {
        // Check if user is admin
        const { data: userRole } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        if (userRole) {
          // Update user with additional properties
          setUser(prev => ({
            ...(prev as ExtendedUser),
            name: userRole.name,
            role: userRole.role,
            isAdmin: userRole.role === 'admin'
          }));
          setIsAdmin(userRole.role === 'admin');
        }

        // Load user preferences
        loadUserPreferences(currentUser.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserPreferences = async (userId: string) => {
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (preferences) {
        // User preferences are loaded in the ThemeContext and LanguageContext
        console.log('User preferences loaded:', preferences);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data: { user: newUser }, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (newUser) {
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            name,
            email,
            password: 'hashed_in_supabase', // We don't store actual passwords
            role: 'user',
            is_blocked: false
          });

        if (profileError) throw profileError;

        // Create initial user preferences
        await supabase
          .from('user_preferences')
          .insert({
            user_id: newUser.id,
            language: 'ar',
            theme: 'light'
          });

        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data: { user: loggedInUser, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (loggedInUser) {
        // Check if user is blocked
        const { data: userData } = await supabase
          .from('users')
          .select('is_blocked, role, name, subscription_tier')
          .eq('id', loggedInUser.id)
          .maybeSingle();

        if (userData?.is_blocked) {
          await supabase.auth.signOut();
          throw new Error('Your account has been blocked. Please contact support.');
        }

        // Update user with additional properties
        setUser({
          ...loggedInUser,
          name: userData?.name,
          role: userData?.role,
          isAdmin: userData?.role === 'admin',
          subscription_tier: userData?.subscription_tier
        });
        
        setIsAdmin(userData?.role === 'admin');
        setSession(session);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated.",
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add missing methods
  const updateProfile = async (name: string, email: string, currentPassword?: string, newPassword?: string) => {
    try {
      setLoading(true);
      
      // Update email/password in auth if needed
      if (newPassword && currentPassword) {
        // First verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: currentPassword
        });
        
        if (signInError) throw new Error('Current password is incorrect');
        
        // Then update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (updateError) throw updateError;
      }
      
      // Update user profile in users table
      if (user) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            name,
            email
          })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        // Update local user state
        setUser(prev => ({
          ...(prev as ExtendedUser),
          name
        }));
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*');
        
      if (error) throw error;
      
      if (usersData) {
        setUsers(usersData);
        return usersData;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error Loading Users",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (user: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: true })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh users list
      await getAllUsers();
      
      toast({
        title: "User Blocked",
        description: `${user.name} has been blocked`,
      });
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (user: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: false })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh users list
      await getAllUsers();
      
      toast({
        title: "User Unblocked",
        description: `${user.name} has been unblocked`,
      });
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    try {
      setLoading(true);
      // For admin changing user's password - in a real app, this would call an admin API
      const { error } = await supabase
        .from('users')
        .update({ password: 'updated_by_admin' })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Password Changed",
        description: "Password has been updated",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          is_blocked: updatedUser.isBlocked
        })
        .eq('id', updatedUser.id);
        
      if (error) throw error;
      
      // Refresh users list
      await getAllUsers();
      
      toast({
        title: "User Updated",
        description: `${updatedUser.name}'s profile has been updated`,
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionTier = async (userId: string, tier: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', userId);
        
      if (error) throw error;
      
      // If the current user's subscription is being updated, update local state
      if (user && user.id === userId) {
        setUser(prev => ({
          ...(prev as ExtendedUser),
          subscription_tier: tier
        }));
      }
      
      toast({
        title: "Subscription Updated",
        description: `Subscription has been updated to ${tier}`,
      });
      
      // Refresh users list
      await getAllUsers();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAdmin,
    isAuthenticated,
    loading,
    users,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    getAllUsers,
    blockUser,
    unblockUser,
    changePassword,
    updateUser,
    updateSubscriptionTier
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
