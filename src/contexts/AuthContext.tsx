import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuthState';
import { AuthContextType, User } from '@/types/auth';
import { supabase, getUserByEmail, getAllProfiles, updateUserProfile } from '@/lib/supabase';
import { loginUser, registerUser, updateUserData, sendEmailVerification, sendPasswordReset } from '@/services/authService';
import { hashPassword, comparePassword } from '@/utils/encryption';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    isAdmin,
    setIsAdmin,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    users,
    setUsers
  } = useAuthState();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'trackmind_user') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(newUser);
        setIsAdmin(newUser?.role === 'admin');
      } else if (e.key === 'trackmind_auth_status') {
        setIsAuthenticated(e.newValue === 'true');
        
        if (e.newValue !== 'true' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          navigate('/login');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, setUser, setIsAdmin, setIsAuthenticated]);

  useEffect(() => {
    const loadInitialSession = async () => {
      try {
        const userEmail = localStorage.getItem('user_email');
        if (userEmail) {
          const userData = await getUserByEmail(userEmail);
          
          if (userData) {
            setUser(userData);
            setIsAdmin(userData.role === 'admin');
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error loading initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialSession();
  }, [setUser, setIsAdmin, setIsAuthenticated, setLoading]);

  const register = async (name: string, email: string, password: string, country?: string) => {
    setLoading(true);
    try {
      await registerUser(name, email, password, country);
      
      toast({
        title: "التسجيل ناجح",
        description: "تم إنشاء حسابك بنجاح.",
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      
      localStorage.setItem('user_email', email);
      
      const appUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.role === 'admin',
        isBlocked: userData.is_blocked,
        role: userData.role,
        subscription_tier: userData.subscription_tier
      };
      
      setUser(appUser);
      setIsAdmin(appUser.role === 'admin' || appUser.isAdmin || false);
      setIsAuthenticated(true);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بعودتك، ${appUser.name}!`,
      });
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = "فشل تسجيل الدخول. الرجاء التحقق من بريدك الإلكتروني وكلمة المرور.";
      
      if ((error as Error).message === 'Invalid credentials') {
        errorMessage = "بريد إلكتروني أو كلمة مرور غير صحيحة";
      } else if ((error as Error).message === 'User is blocked') {
        errorMessage = "تم حظر هذا الحساب. الرجاء الاتصال بالدعم.";
      }
      
      toast({
        title: "فشل تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user_email');
    
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    
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
        .from('profiles')
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
      await updateUserData(updatedUser);
      
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
        const userData = await getUserByEmail(user.email);
          
        if (!userData || !userData.password || !comparePassword(currentPassword, userData.password)) {
          throw new Error('Current password is incorrect');
        }
        
        updateData.password = hashPassword(newPassword);
      }
      
      await updateUserProfile(user.id, updateData);
      
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
      const profiles = await getAllProfiles();
      
      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        isAdmin: profile.role === 'admin',
        isBlocked: profile.is_blocked,
        subscription_tier: profile.subscription_tier || 'free'
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
        .from('profiles')
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
        .from('profiles')
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
      const userData = await getUserByEmail(email);
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      const hashedPassword = hashPassword(newPassword);
      
      await updateUserProfile(userData.id, { password: hashedPassword });
      
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
        .from('profiles')
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
      return await sendEmailVerification(email);
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
      await sendPasswordReset(email);
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
