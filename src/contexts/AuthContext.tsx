
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  subscription_tier?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  updateProfile: (name: string, email: string, currentPassword?: string, newPassword?: string) => Promise<void>;
  updateSubscriptionTier: (tier: string) => Promise<void>;
  changePassword: (email: string, password: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  blockUser: (user: User) => Promise<void>;
  unblockUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state change:", event, session);
            setSession(session);
            
            if (session?.user) {
              const userData: User = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || '',
              };
              
              setUser(userData);
              setIsAuthenticated(true);
              
              // Use setTimeout to avoid recursive auth calls
              setTimeout(() => {
                checkUserRole(session.user.id);
              }, 0);
            } else {
              setUser(null);
              setIsAuthenticated(false);
              setIsAdmin(false);
            }
          }
        );
        
        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session);
        setSession(session);
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          await checkUserRole(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
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

  const checkUserRole = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_blocked, role, subscription_tier')
        .eq('id', userId)
        .maybeSingle();
      
      if (userData && !userError) {
        console.log("User data:", userData);
        const isAdminUser = userData.role === 'admin';
        setIsAdmin(isAdminUser);
        
        setUser(prevUser => {
          if (prevUser) {
            return {
              ...prevUser,
              isAdmin: isAdminUser,
              isBlocked: userData.is_blocked,
              subscription_tier: userData.subscription_tier || 'free',
            };
          }
          return prevUser;
        });
        
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (!error && data) {
        console.log("Profile data:", data);
        setIsAdmin(false);
        
        setUser(prevUser => {
          if (prevUser) {
            return {
              ...prevUser,
              isAdmin: false,
            };
          }
          return prevUser;
        });
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data);
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

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Directly create the user in our custom users table first
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error(language === 'ar' 
          ? 'البريد الإلكتروني مسجل بالفعل. الرجاء استخدام بريد إلكتروني آخر أو تسجيل الدخول.' 
          : 'Email already registered. Please use a different email or sign in.');
      }
      
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });
      
      if (error) throw error;
      console.log("Registration successful:", data);

      // Create the user in our custom users table
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: name,
            email: email,
            password: 'hashed_in_auth', // We don't store actual passwords here
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating user in database:', insertError);
          // We don't throw here as the auth user is already created
        }
      }
      
      toast({
        title: language === 'ar' ? "تم التسجيل بنجاح" : "Registration Successful",
        description: language === 'ar' 
          ? "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول." 
          : "Your account has been created successfully. You can now sign in.",
      });
      
      // Redirect to login instead of auto-login
      navigate('/login');
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

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const origin = window.location.origin;
      const redirectUrl = `${origin}/reset-password`;
      
      console.log("Reset password redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
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

  const resetPassword = async (newPassword: string) => {
    try {
      if (newPassword.length < 8) {
        throw new Error(language === 'ar' 
          ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' 
          : 'Password must be at least 8 characters long');
      }

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

  const updateProfile = async (
    name: string, 
    email: string, 
    currentPassword?: string, 
    newPassword?: string
  ) => {
    try {
      setLoading(true);
      
      if (currentPassword && newPassword) {
        await changePassword(email, newPassword);
      }
      
      const { error } = await supabase.auth.updateUser({
        email: email !== user?.email ? email : undefined,
        data: { name },
      });
      
      if (error) throw error;
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser({
          id: updatedUser.id,
          email: updatedUser.email || '',
          name: updatedUser.user_metadata?.name || '',
          isAdmin: user?.isAdmin || false,
          isBlocked: user?.isBlocked || false,
          subscription_tier: user?.subscription_tier || 'free'
        });
      }
      
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

  const changePassword = async (email: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        user?.id || '',
        { password: newPassword }
      );
      
      if (error) throw error;
      
      toast({
        title: language === 'ar' ? "تم التحديث" : "Password Updated",
        description: language === 'ar' 
          ? "تم تحديث كلمة المرور بنجاح" 
          : "Password has been updated successfully",
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const updateSubscriptionTier = async (tier: string) => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error: usersError } = await supabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', user.id);
      
      if (usersError) {
        const { error: profilesError } = await supabase
          .from('profiles')
          .update({ 
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
          
        if (profilesError) {
          throw profilesError;
        }
      }
      
      setUser(prevUser => {
        if (prevUser) {
          return {
            ...prevUser,
            subscription_tier: tier
          };
        }
        return prevUser;
      });
      
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

  const getAllUsers = async (): Promise<User[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*');
      
      if (error) throw error;
      
      if (data) {
        const formattedUsers = data.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.role === 'admin',
          isBlocked: user.is_blocked || false,
          subscription_tier: user.subscription_tier || 'free',
          created_at: user.created_at,
          updated_at: user.updated_at
        }));
        
        setUsers(formattedUsers);
        return formattedUsers;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: language === 'ar' ? "فشل في جلب المستخدمين" : "Failed to fetch users",
        description: "An error occurred while fetching users",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (user: User): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: true })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === user.id ? { ...u, isBlocked: true } : u
      ));
      
      toast({
        title: language === 'ar' ? "تم حظر المستخدم" : "User Blocked",
        description: language === 'ar'
          ? `تم حظر ${user.name || user.email} بنجاح`
          : `${user.name || user.email} has been blocked successfully`,
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: language === 'ar' ? "فشل في حظر المستخدم" : "Failed to block user",
        description: "An error occurred while blocking the user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (user: User): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: false })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === user.id ? { ...u, isBlocked: false } : u
      ));
      
      toast({
        title: language === 'ar' ? "تم إلغاء حظر المستخدم" : "User Unblocked",
        description: language === 'ar'
          ? `تم إلغاء حظر ${user.name || user.email} بنجاح`
          : `${user.name || user.email} has been unblocked successfully`,
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: language === 'ar' ? "فشل في إلغاء حظر المستخدم" : "Failed to unblock user",
        description: "An error occurred while unblocking the user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (user: User): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ 
          name: user.name, 
          email: user.email,
          role: user.isAdmin ? 'admin' : 'user',
          subscription_tier: user.subscription_tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === user.id ? user : u
      ));
      
      toast({
        title: language === 'ar' ? "تم تحديث المستخدم" : "User Updated",
        description: language === 'ar'
          ? `تم تحديث ${user.name || user.email} بنجاح`
          : `${user.name || user.email} has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: language === 'ar' ? "فشل في تحديث المستخدم" : "Failed to update user",
        description: "An error occurred while updating the user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isAdmin,
    loading,
    users,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateSubscriptionTier,
    changePassword,
    getAllUsers,
    blockUser,
    unblockUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
