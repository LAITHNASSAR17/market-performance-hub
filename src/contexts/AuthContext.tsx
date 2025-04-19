
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
  signIn: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // Alias for signIn
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

  // Fix 1: Add proper login method with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Error signing in:', error);
        throw error;
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك مرة أخرى",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Exception signing in:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل تسجيل الدخول",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alias for backward compatibility
  const login = signIn;

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        description: "تم تسجيل الخروج بنجاح",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل تسجيل الخروج",
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

        // Fix 2: Add the user ID to the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
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
          title: "نجاح",
          description: "تم التسجيل بنجاح! تحقق من بريدك الإلكتروني للتحقق من حسابك",
        });
        navigate('/verify-email');
      } catch (error: any) {
        console.error('Error during post-registration:', error);
        toast({
          title: "خطأ",
          description: error.message || "فشل إنشاء الملف الشخصي",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Exception signing up:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل التسجيل",
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
        title: "تحقق من بريدك الإلكتروني",
        description: "لقد أرسلنا لك رابطاً لإعادة تعيين كلمة المرور",
      });
    } catch (error: any) {
      console.error('Exception sending reset password email:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال بريد إلكتروني لإعادة تعيين كلمة المرور",
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
        description: "تم تحديث كلمة المرور بنجاح!",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Exception updating password:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fix 3: Update the verification method
  const handleVerifyEmail = async (token: string, type: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token,
        type: type === 'email' ? 'email' : 'sms',
        email: '', // This is a required field in the latest Supabase version
      });

      if (error) {
        console.error('Error verifying email:', error);
        throw error;
      }

      toast({
        description: "تم التحقق من البريد الإلكتروني بنجاح!",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Exception verifying email:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل التحقق من البريد الإلكتروني",
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
        title: "خطأ",
        description: "فشل جلب المستخدمين",
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
        title: "تم حظر المستخدم",
        description: `تم حظر ${user.name} بنجاح`
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "خطأ",
        description: "فشل حظر المستخدم",
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
        title: "تم إلغاء حظر المستخدم",
        description: `تم إلغاء حظر ${user.name} بنجاح`
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "خطأ",
        description: "فشل إلغاء حظر المستخدم",
        variant: "destructive"
      });
    }
  };

  const changePassword = async (userId: string, newPassword: string): Promise<void> => {
    // Note: In a real application, this would need to be handled by a server function
    // as client-side code can't change other users' passwords directly
    toast({
      title: "العملية غير مدعومة",
      description: "تغيير كلمات المرور للمستخدمين الآخرين يتطلب تنفيذ على جانب الخادم",
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
        title: "تم تحديث المستخدم",
        description: `تم تحديث ${userData.name} بنجاح`
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "خطأ",
        description: "فشل تحديث المستخدم",
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
        login,
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
