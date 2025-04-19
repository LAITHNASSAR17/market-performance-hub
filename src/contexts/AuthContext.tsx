import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface AuthContextType {
  user: any;  // Consider defining a more specific User type
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, country: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name?: string, email?: string, currentPassword?: string, newPassword?: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateSubscriptionTier: (tier: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error fetching profile",
            description: "Failed to retrieve user profile data.",
            variant: "destructive"
          });
        }

        setUser({
          ...session.user,
          ...profileData
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      setIsAuthenticated(true);
      navigate('/dashboard');
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, country: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            country,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Create a user profile in the 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { id: data.user?.id, name: name, email: email, country: country },
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: "Registration failed",
          description: "Failed to create user profile.",
          variant: "destructive"
        });
      }

      setUser(data.user);
      setIsAuthenticated(true);
      navigate('/dashboard');
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account."
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
      toast({
        title: "Logout successful",
        description: "You have been successfully logged out."
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name?: string, email?: string, currentPassword?: string, newPassword?: string) => {
    setLoading(true);
    try {
      if (newPassword && currentPassword) {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
      }

      const { data: user, error: userError } = await supabase.auth.updateUser({
        email: email,
        data: {
          name: name,
        },
      });

      if (userError) throw userError;

      // Update the user state with the new data
      setUser((prevUser: any) => ({
        ...prevUser,
        ...user?.user?.user_metadata,
        email: email,
      }));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Password reset email sent",
        description: "Please check your email to reset your password."
      });
    } catch (error: any) {
      console.error('Send password reset email error:', error);
      toast({
        title: "Failed to send reset email",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionTier = async (tier: string) => {
    setLoading(true);
    try {
      // Implement your logic to update the subscription tier in the database
      // This might involve calling a Supabase function or updating a table
      toast({
        title: "Subscription tier updated",
        description: `Your subscription tier has been updated to ${tier}.`
      });
    } catch (error: any) {
      console.error('Update subscription tier error:', error);
      toast({
        title: "Failed to update subscription tier",
        description: error.message || "Failed to update subscription tier. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    sendPasswordResetEmail,
    updateSubscriptionTier,
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
