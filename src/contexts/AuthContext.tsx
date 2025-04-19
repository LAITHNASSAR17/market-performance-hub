import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: Session['user'] | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleRegister: (formData: any) => Promise<void>;
  handleForgotPassword: (email: string) => Promise<void>;
  handleUpdatePassword: (accessToken: string, newPassword: string) => Promise<void>;
  handleVerifyEmail: (token: string, type: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
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

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
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
      const { error } = await supabase.auth.verifyOtp({
        type: type,
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

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signIn,
        signOut,
        handleRegister,
        handleForgotPassword,
        handleUpdatePassword,
        handleVerifyEmail,
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
