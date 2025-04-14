import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { useAuthState, useAuthStateSetters } from '@/hooks/useAuthState';
import type { AuthContextType, User } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = useAuthState();
  const {
    setUser,
    setIsAdmin,
    setIsAuthenticated,
    setLoading,
    setUsers
  } = useAuthStateSetters();

  // Initialize admin user in Supabase if it doesn't exist
  React.useEffect(() => {
    const initializeAdminUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'lnmr2001@gmail.com')
        .single();

      if (error && error.code === 'PGRST116') {
        // Create admin if doesn't exist
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
        }
      }
    };

    initializeAdminUser();
  }, []);

  // Check session on mount
  React.useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();

          if (error) throw error;

          const currentUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isAdmin: userData.role === 'admin',
            subscription_tier: userData.subscription_tier || 'free'
          };

          setUser(currentUser);
          setIsAdmin(currentUser.isAdmin);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          await supabase.auth.signOut();
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    };

    checkSession();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await authService.register(name, email, password);
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: (error as Error).message || "Could not register user",
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
      const userData = await authService.login(email, password);
      
      const userToStore = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isAdmin: userData.role === 'admin',
        subscription_tier: userData.subscription_tier || 'free'
      };

      setUser(userToStore);
      setIsAdmin(userData.role === 'admin');
      setIsAuthenticated(true);
      
      navigate('/dashboard');
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userToStore.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: (error as Error).message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const forgotPassword = async (email: string) => {
    console.log(`Forgot password requested for ${email}`);
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`resetCode_${email}`, resetCode);
    console.log(`Reset code for ${email}: ${resetCode}`);
    toast({
      title: "Reset Code Generated",
      description: "Check console for the reset code (would be emailed in a real app)"
    });
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
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

  const updateUser = async (updatedUser: User) => {
    try {
      await authService.updateUser(updatedUser.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role || updatedUser.isAdmin ? 'admin' : 'user',
        is_blocked: updatedUser.isBlocked || false,
        subscription_tier: updatedUser.subscription_tier || 'free'
      });
      
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      if (state.user && state.user.id === updatedUser.id) {
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

  const updateProfile = async (
    name: string, 
    email: string, 
    currentPassword?: string, 
    newPassword?: string
  ) => {
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

  const getAllUsers = async () => {
    try {
      const users = await authService.getAllUsers();
      const formattedUsers = users.map(user => ({
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

  const blockUser = async (user: User) => {
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

  const unblockUser = async (user: User) => {
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

  const changePassword = async (email: string, newPassword: string) => {
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

  const updateSubscriptionTier = async (userId: string, tier: string) => {
    try {
      await authService.updateSubscriptionTier(userId, tier);
      
      if (state.user && state.user.id === userId) {
        setUser({
          ...state.user,
          subscription_tier: tier
        });
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

  const value = {
    ...state,
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!state.loading && children}
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
