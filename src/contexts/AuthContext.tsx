import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hashPassword, comparePassword } from '@/utils/encryption';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  role?: string;
  subscription_tier?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  users: User[];
  register: (name: string, email: string, password: string, country?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  updateProfile: (name: string, email: string, currentPassword?: string, newPassword?: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  blockUser: (user: User) => Promise<void>;
  unblockUser: (user: User) => Promise<void>;
  changePassword: (email: string, newPassword: string) => Promise<void>;
  updateSubscriptionTier: (userId: string, tier: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Session storage keys
const USER_STORAGE_KEY = 'trackmind_user';
const AUTH_STATUS_KEY = 'trackmind_auth_status';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser)?.role === 'admin' : false;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STATUS_KEY) === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle storage events to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_STORAGE_KEY) {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(newUser);
        setIsAdmin(newUser?.role === 'admin');
      } else if (e.key === AUTH_STATUS_KEY) {
        setIsAuthenticated(e.newValue === 'true');
        
        // If logged out in another tab, redirect to login
        if (e.newValue !== 'true' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          navigate('/login');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Save auth state to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    
    localStorage.setItem(AUTH_STATUS_KEY, isAuthenticated.toString());
  }, [user, isAuthenticated]);

  useEffect(() => {
    const initializeAdminUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'lnmr2001@gmail.com')
        .single();

      if (error && error.code === 'PGRST116') {
        const adminEmail = 'lnmr2001@gmail.com';
        const adminPassword = hashPassword('password123');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            name: 'Admin User',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            is_blocked: false,
            subscription_tier: 'premium'
          });
          
        if (insertError) {
          console.error('Error creating admin user:', insertError);
        } else {
          console.log('Test admin user created:', adminEmail);
        }
      }
    };

    initializeAdminUser();
  }, []);

  useEffect(() => {
    const loadInitialSession = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', localStorage.getItem('user_email'))
          .single();

        if (data) {
          setUser(data);
          setIsAdmin(data.role === 'admin');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialSession();
  }, []);

  const register = async (name: string, email: string, password: string, country?: string): Promise<void> => {
    setLoading(true);
    try {
      const hashedPassword = hashPassword(password);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password: hashedPassword,
          role: 'user',
          is_blocked: false,
          subscription_tier: 'free',
          email_verified: false
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      if (country) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.id,
            country: country
          });
          
        if (profileError) console.error('Error creating profile:', profileError);
      }
      
      console.log("User registered successfully:", data);
      
      try {
        await sendVerificationEmail(email);
        console.log("Verification email sent successfully");
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
      }
      
      toast({
        title: "التسجيل ناجح",
        description: "تم إنشاء حسابك بنجاح. تحقق من بريدك الإلكتروني للتحقق من حسابك.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "فشل التسجيل",
        description: (error as Error).message || "تعذر تسجيل المستخدم",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !data) throw new Error('Invalid credentials');
      
      console.log('Login attempt:', email);
      console.log('Found user:', data ? 'Yes' : 'No');
      
      if (comparePassword(password, data.password)) {
        if (data.is_blocked) {
          throw new Error('User is blocked');
        }
        
        if (!data.email_verified) {
          toast({
            title: "البريد الإلكتروني غير مفعل",
            description: "يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك. تم إرسال رابط التفعيل إلى بريدك الإلكتروني.",
            variant: "destructive",
          });
          
          try {
            await sendVerificationEmail(email);
            console.log("Verification email resent successfully");
          } catch (emailError) {
            console.error("Error resending verification email:", emailError);
          }
          
          throw new Error('البريد الإلكتروني غير مفعل');
        }
        
        // Save email for session recovery
        localStorage.setItem('user_email', email);
        
        setUser(data);
        setIsAdmin(data.role === 'admin');
        setIsAuthenticated(true);
        
        console.log('Authentication successful, user set:', data.name);
        console.log('Role:', data.role, 'isAdmin:', data.role === 'admin');
        console.log('isAuthenticated set to true');
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.name}!`,
        });
        
        return;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove current session data
    localStorage.removeItem('user_email');
    
    // Update state
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    
    // Navigate to login page
    navigate('/login');
  };

  const forgotPassword = async (email: string): Promise<void> => {
    console.log(`Forgot password requested for ${email}`);
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`resetCode_${email}`, resetCode);
    console.log(`Reset code for ${email}: ${resetCode}`);
    toast({
      title: "Reset Code Generated",
      description: "Check console for the reset code (would be emailed in a real app)"
    });
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<void> => {
    const storedResetCode = localStorage.getItem(`resetCode_${email}`);
    if (storedResetCode === resetCode) {
      const hashedPassword = hashPassword(newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', email);
      
      if (error) throw new Error('Failed to reset password');
      
      localStorage.removeItem(`resetCode_${email}`);
      toast({
        title: "Success",
        description: "Password reset successfully",
      });
      navigate('/login');
    } else {
      throw new Error('Invalid reset code');
    }
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role || updatedUser.isAdmin ? 'admin' : 'user',
          is_blocked: updatedUser.isBlocked || false,
          subscription_tier: updatedUser.subscription_tier || 'free'
        })
        .eq('id', updatedUser.id);
      
      if (error) throw error;
      
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      if (user && user.id === updatedUser.id) {
        const updatedCurrentUser = {
          ...updatedUser,
          role: updatedUser.role || (updatedUser.isAdmin ? 'admin' : 'user')
        };
        setUser(updatedCurrentUser);
        setIsAdmin(updatedCurrentUser.role === 'admin' || updatedCurrentUser.isAdmin || false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const updateProfile = async (name: string, email: string, currentPassword?: string, newPassword?: string): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updateData: any = {
        name,
        email
      };
      
      if (newPassword && currentPassword) {
        const { data } = await supabase
          .from('users')
          .select('password')
          .eq('id', user.id)
          .single();
          
        if (!data || !comparePassword(currentPassword, data.password)) {
          throw new Error('Current password is incorrect');
        }
        
        updateData.password = hashPassword(newPassword);
      }
      
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      const updatedUser = {
        ...user,
        name,
        email
      };
      
      setUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Could not update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      
      const formattedUsers = data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        isBlocked: user.is_blocked,
        subscription_tier: user.subscription_tier || 'free'
      }));
      
      setUsers(formattedUsers);
      return formattedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const blockUser = async (user: User): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: true })
        .eq('id', user.id);
      
      if (error) throw error;
      
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      if (user.id === user?.id) {
        logout();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const unblockUser = async (user: User): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: false })
        .eq('id', user.id);
      
      if (error) throw error;
      
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  const changePassword = async (email: string, newPassword: string): Promise<void> => {
    try {
      const hashedPassword = hashPassword(newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', email);
      
      if (error) throw error;
      
      toast({
        title: "Success", 
        description: "Password changed successfully"
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  const updateSubscriptionTier = async (userId: string, tier: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', userId);
        
      if (error) throw error;
      
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          subscription_tier: tier
        };
        
        setUser(updatedUser);
      }
      
      await getAllUsers();
      
      toast({
        title: "Subscription Updated",
        description: `Subscription tier updated to ${tier}`
      });
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Could not update subscription",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      console.log(`Sending verification email to ${email}`);
      
      const verificationLink = `https://trackmind.vip/verify?email=${encodeURIComponent(email)}`;
      console.log(`Verification link: ${verificationLink}`);
      
      console.log("Calling Supabase function with parameters:", {
        type: 'verification',
        email,
        verificationLink
      });
      
      const response = await supabase.functions.invoke('send-email', {
        body: {
          type: 'verification',
          email,
          verificationLink,
        },
      });

      if (response.error) {
        console.error('Error from edge function:', response.error);
        throw new Error(response.error.message || 'Failed to send verification email');
      }

      console.log('Verification email sent response:', response);
      
      toast({
        title: "تم إرسال البريد الإلكتروني",
        description: "تم إرسل رابط التحقق إلى بريدك الإلكتروني",
      });
      
      return response;
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال بريد التحقق. حاول مرة أخرى.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      console.log(`Sending password reset email to ${email}`);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        console.error('User not found:', userError);
        toast({
          title: "خطأ",
          description: "البريد الإلكتروني غير مسجل في النظام",
          variant: "destructive",
        });
        throw new Error("User not found");
      }
      
      const resetLink = `https://trackmind.vip/reset-password?email=${encodeURIComponent(email)}`;
      console.log(`Reset password link: ${resetLink}`);
      
      console.log("Calling Supabase function for password reset email");
      const response = await supabase.functions.invoke('send-email', {
        body: {
          type: 'reset-password',
          email,
          resetLink,
        },
      });

      console.log('Password reset email response:', response);

      if (response.error) {
        console.error('Email sending error:', response.error);
        throw new Error(response.error.message || 'Failed to send password reset email');
      }
      
      return response;
    } catch (error) {
      console.error('Password reset email error:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال بريد إعادة تعيين كلمة المرور",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    isAuthenticated,
    loading,
    users,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    updateProfile,
    getAllUsers,
    blockUser,
    unblockUser,
    changePassword,
    updateSubscriptionTier,
    sendVerificationEmail,
    sendPasswordResetEmail,
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
