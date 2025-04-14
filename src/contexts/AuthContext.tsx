
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

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
  resetPassword: (newPassword: string) => Promise<void>;
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
  
  // Get the current language from localStorage instead of using the hook
  const getCurrentLanguage = (): 'ar' | 'en' => {
    return (localStorage.getItem('language') as 'ar' | 'en') || 'ar';
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser as ExtendedUser | null);
        setSession(session);
        setIsAuthenticated(!!currentUser);
        setLoading(false);

        if (currentUser) {
          const { data: userRole } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', currentUser.id)
            .maybeSingle();
          
          if (userRole) {
            setUser(prev => ({
              ...(prev as ExtendedUser),
              name: userRole.name,
              role: userRole.role,
              isAdmin: userRole.role === 'admin'
            }));
            setIsAdmin(userRole.role === 'admin');
          }

          loadUserPreferences(currentUser.id);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser as ExtendedUser | null);
      setSession(session);
      setIsAuthenticated(!!currentUser);

      if (currentUser) {
        const { data: userRole } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        if (userRole) {
          setUser(prev => ({
            ...(prev as ExtendedUser),
            name: userRole.name,
            role: userRole.role,
            isAdmin: userRole.role === 'admin'
          }));
          setIsAdmin(userRole.role === 'admin');
        }

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
        console.log('User preferences loaded:', preferences);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        throw new Error('البريد الإلكتروني مسجل بالفعل. الرجاء استخدام بريد إلكتروني آخر أو تسجيل الدخول.');
      }
      
      const { data: { user: newUser }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });

      if (error) throw error;

      if (newUser) {
        const verificationLink = `${window.location.origin}/login?verified=true`;
        
        try {
          const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
            body: { 
              email, 
              name, 
              verificationLink 
            },
          });
          
          if (emailError) {
            console.error('Error sending verification email:', emailError);
          }
        } catch (emailErr) {
          console.error('Failed to invoke send-verification-email function:', emailErr);
        }

        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            name,
            email,
            role: 'user',
            is_blocked: false,
            password: 'stored_in_auth'
          });

        if (profileError) {
          throw profileError;
        }

        await supabase
          .from('user_preferences')
          .insert({
            user_id: newUser.id,
            language: 'ar',
            theme: 'light'
          });

        toast({
          title: "تم التسجيل بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.",
        });

        navigate('/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        toast({
          title: "فشل التسجيل",
          description: "البريد الإلكتروني مسجل بالفعل. الرجاء استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "فشل التسجيل",
          description: error.message,
          variant: "destructive",
        });
      }
      
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
        const { data: userData } = await supabase
          .from('users')
          .select('is_blocked, role, name, subscription_tier')
          .eq('id', loggedInUser.id)
          .maybeSingle();

        if (userData?.is_blocked) {
          await supabase.auth.signOut();
          throw new Error('Your account has been blocked. Please contact support.');
        }

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
      
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .maybeSingle();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      const resetLink = `${window.location.origin}/reset-password`;
      const language = getCurrentLanguage();
      
      try {
        // Attempt to send styled email via edge function
        const { data, error: emailError } = await supabase.functions.invoke('send-reset-email', {
          body: { 
            email,
            name: userData?.name || email,
            resetLink,
            language
          },
        });
        
        if (emailError) {
          console.error('Error invoking send-reset-email function:', emailError);
        }
        
        // Handle the Resend email validation error by showing a success message anyway
        // (Supabase's default email will still be sent)
        if (data && data.status === "domain_not_verified") {
          toast({
            title: language === 'ar' ? "تم إرسال رابط إعادة التعيين" : "Reset Link Sent",
            description: data.message,
          });
          return;
        }
      } catch (emailErr) {
        console.error('Failed to invoke send-reset-email function:', emailErr);
        // Don't throw here - we still want to show success since Supabase's email was sent
      }

      toast({
        title: language === 'ar' ? "إعادة تعيين كلمة المرور" : "Reset Password",
        description: language === 'ar' 
          ? "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني."
          : "Reset link has been sent to your email.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      const language = getCurrentLanguage();
      toast({
        title: language === 'ar' ? "فشل إعادة التعيين" : "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح.",
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Failed to Update Password",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name: string, email: string, currentPassword?: string, newPassword?: string) => {
    try {
      setLoading(true);
      
      if (newPassword && currentPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: currentPassword
        });
        
        if (signInError) throw new Error('Current password is incorrect');
        
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (updateError) throw updateError;
      }
      
      if (user) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            name,
            email
          })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
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
