
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Extend the User type from Supabase to include our custom fields
interface ExtendedUser extends User {
  name?: string;
  subscription_tier?: string;
  role?: string;
  isAdmin?: boolean;
}

type AuthContextType = {
  session: Session | null;
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut for compatibility
  handleRegister: (formData: any) => Promise<void>;
  handleForgotPassword: (email: string) => Promise<void>;
  handleUpdatePassword: (accessToken: string, newPassword: string) => Promise<void>;
  handleVerifyEmail: (token: string, type: string) => Promise<void>;
  getAllUsers: () => Promise<void>;
  users: any[];
  blockUser: (user: any) => Promise<void>;
  unblockUser: (user: any) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          // Get user profile from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          // Combine auth user with profile data
          const extendedUser: ExtendedUser = {
            ...session.user,
            name: profileData?.name || '',
            subscription_tier: profileData?.subscription_tier || 'free',
            role: profileData?.role || 'user',
            isAdmin: profileData?.role === 'admin'
          };
          
          setUser(extendedUser);
          setIsAuthenticated(true);
          setIsAdmin(profileData?.role === 'admin');
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        toast({
          title: "Error",
          description: "Failed to retrieve session.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user) {
        // Get user profile from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        // Combine auth user with profile data
        const extendedUser: ExtendedUser = {
          ...session.user,
          name: profileData?.name || '',
          subscription_tier: profileData?.subscription_tier || 'free',
          role: profileData?.role || 'user',
          isAdmin: profileData?.role === 'admin'
        };
        
        setUser(extendedUser);
        setIsAuthenticated(true);
        setIsAdmin(profileData?.role === 'admin');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });
  }, [toast]);

  const signIn = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        console.error('Error signing in:', error);
        throw error;
      }
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in.",
      });
    } catch (error: any) {
      console.error('Exception signing in:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        description: "Signed out successfully.",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for backward compatibility
  const logout = signOut;

  const handleRegister = async (formData: any): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Error signing up:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('User not found after signup');
      }

      // Create profile for the new user
      try {
        // Generate UUID for the new user to match the auth.users id
        const userId = data.user?.id;
        
        if (!userId) {
          throw new Error('User ID not available');
        }

        // Create a profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId, // Use the UUID from auth.users
            name: formData.name,
            email: formData.email,
            password: '', // We don't store the actual password in profiles
            role: 'user',
            is_blocked: false,
            email_verified: false,
            subscription_tier: 'free'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }

        toast({
          title: "Success",
          description: "Registration successful! Check your email to verify your account.",
        });
        navigate('/verify-email');
      } catch (error: any) {
        console.error('Error during post-registration:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create profile.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Exception signing up:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign up.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        console.error('Error sending reset password email:', error);
        throw error;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a link to reset your password.",
      });
    } catch (error: any) {
      console.error('Exception sending reset password email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset password email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (accessToken: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }

      toast({
        description: "Password updated successfully!",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Exception updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (token: string, type: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Use the type as MobileOtpType or EmailOtpType from Supabase
      const otpType = type === 'email' ? 'email' : 'sms' as any;
      
      const { error } = await supabase.auth.verifyOtp({
        type: otpType,
        token: token,
      });

      if (error) {
        console.error('Error verifying email:', error);
        throw error;
      }

      toast({
        description: "Email verified successfully!",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Exception verifying email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin functions
  const getAllUsers = async (): Promise<void> => {
    try {
      // Get users from the profiles table (not auth.users which isn't accessible via API)
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive"
      });
    }
  };

  const blockUser = async (user: any): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: true })
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh users list
      getAllUsers();
      
      toast({
        title: "User Blocked",
        description: `${user.name} has been blocked successfully.`
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user.",
        variant: "destructive"
      });
    }
  };

  const unblockUser = async (user: any): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: false })
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh users list
      getAllUsers();
      
      toast({
        title: "User Unblocked",
        description: `${user.name} has been unblocked successfully.`
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user.",
        variant: "destructive"
      });
    }
  };

  const changePassword = async (userId: string, newPassword: string): Promise<void> => {
    // Note: In a real application, this would need to be handled by a server function
    // as client-side code can't change other users' passwords directly
    toast({
      title: "Operation Not Supported",
      description: "Password changes for other users requires server-side implementation.",
      variant: "destructive"
    });
  };

  const updateUser = async (userData: any): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          role: userData.role,
          email: userData.email,
          is_blocked: userData.is_blocked,
          subscription_tier: userData.subscription_tier
        })
        .eq('id', userData.id);

      if (error) throw error;
      
      // Refresh users list
      getAllUsers();
      
      toast({
        title: "User Updated",
        description: `${userData.name} has been updated successfully.`
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        signIn,
        signOut,
        logout,
        handleRegister,
        handleForgotPassword,
        handleUpdatePassword,
        handleVerifyEmail,
        getAllUsers,
        users,
        blockUser,
        unblockUser,
        changePassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
