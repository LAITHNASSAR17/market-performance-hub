
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  updateProfile: (name: string, email: string, currentPassword?: string, newPassword?: string) => Promise<void>;
  updateSubscriptionTier: (tier: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
            
            if (session?.user) {
              await checkUserRole(session.user.id);
            } else {
              setIsAdmin(false);
            }
          }
        );
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          await checkUserRole(session.user.id);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  // Check if user has admin role
  const checkUserRole = async (userId: string) => {
    try {
      // Fetch user data from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      console.log("Admin check data:", data);
      setIsAdmin(data?.is_admin === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: language === 'ar' ? "فشل تسجيل الدخول" : "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      // Auto login after registration
      await login(email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: language === 'ar' ? "فشل التسجيل" : "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: language === 'ar' ? "تم إرسال البريد الإلكتروني" : "Email Sent",
        description: language === 'ar' 
          ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" 
          : "A password reset link has been sent to your email",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: language === 'ar' ? "فشل إرسال البريد الإلكتروني" : "Email Send Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (newPassword: string) => {
    try {
      // Password validation
      if (newPassword.length < 8) {
        throw new Error(language === 'ar' 
          ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' 
          : 'Password must be at least 8 characters long');
      }

      // Strong password regex (at least one uppercase, one lowercase, one number)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordRegex.test(newPassword)) {
        throw new Error(language === 'ar' 
          ? 'كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام' 
          : 'Password must include uppercase, lowercase letters and numbers');
      }

      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: language === 'ar' ? "تم تغيير كلمة المرور" : "Password Changed",
        description: language === 'ar' 
          ? "تم تحديث كلمة المرور بنجاح" 
          : "Your password has been successfully updated",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: language === 'ar' ? "فشل تحديث كلمة المرور" : "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (
    name: string, 
    email: string, 
    currentPassword?: string, 
    newPassword?: string
  ) => {
    try {
      setLoading(true);
      
      // Update auth data first (email or password)
      if (currentPassword && newPassword) {
        // Change password flow
        await changePassword(currentPassword, newPassword);
      }
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        email: email !== user?.email ? email : undefined,
        data: { name },
      });
      
      if (error) throw error;
      
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      
      toast({
        title: language === 'ar' ? "تم التحديث" : "Profile Updated",
        description: language === 'ar' 
          ? "تم تحديث الملف الشخصي بنجاح" 
          : "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: language === 'ar' ? "فشل التحديث" : "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error(language === 'ar' 
          ? "كلمة المرور الحالية غير صحيحة" 
          : "Current password is incorrect");
      }
      
      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: language === 'ar' ? "تم التحديث" : "Password Updated",
        description: language === 'ar' 
          ? "تم تحديث كلمة المرور بنجاح" 
          : "Your password has been updated successfully",
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  // Update subscription tier
  const updateSubscriptionTier = async (tier: string) => {
    try {
      setLoading(true);
      
      // This would typically involve updating a user's subscription in your database
      // Example implementation - adjust based on your actual data structure
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: language === 'ar' ? "تم تحديث الاشتراك" : "Subscription Updated",
        description: language === 'ar' 
          ? `تم تحديث خطة اشتراكك إلى ${tier}` 
          : `Your subscription has been updated to ${tier}`,
      });
    } catch (error: any) {
      console.error('Subscription update error:', error);
      toast({
        title: language === 'ar' ? "فشل تحديث الاشتراك" : "Subscription Update Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isAdmin,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateSubscriptionTier,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
