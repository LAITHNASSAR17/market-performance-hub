import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  handleRegister: (formData: any) => Promise<void>;
  handleForgotPassword: (email: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
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
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
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
        } catch (err) {
          console.error('Error fetching profile data:', err);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log(`Attempting to sign in with email: ${email}`);
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
      
      if (data.session) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Exception signing in:', error);
      let errorMessage = "فشل تسجيل الدخول. الرجاء التحقق من بريدك الإلكتروني وكلمة المرور.";
      
      if (error.message === 'Invalid login credentials' || error.message === 'Invalid credentials') {
        errorMessage = "بريد إلكتروني أو كلمة مرور غير صحيحة";
      } else if (error.message === 'User is blocked') {
        errorMessage = "تم حظر هذا الحساب. الرجاء الاتصال بالدعم.";
      } else if (error.message === 'Email is not activated') {
        errorMessage = "البريد الإلكتروني غير مفعل. يرجى التحقق من بريدك الإلكتروني لتنشيط حسابك.";
      }
      
      toast({
        title: "فشل تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = signIn;

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      toast({
        description: "تم تسجيل الخروج بنجاح",
      });
      navigate('/login');
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

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user?.id,
          name: formData.name,
          email: formData.email,
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
      console.error('Exception signing up:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل إنشاء الملف الشخصي",
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

  const sendPasswordResetEmail = handleForgotPassword;

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

  const handleVerifyEmail = async (token: string, type: string): Promise<void> => {
    try {
      if (type === 'email') {
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: 'email',
          email: ''
        });
        
        if (error) throw error;
      } else if (type === 'phone_change') {
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: 'phone_change',
          phone: ''
        });
        
        if (error) throw error;
      } else {
        throw new Error('Invalid verification type');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<void> => {
    try {
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
        sendPasswordResetEmail,
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
