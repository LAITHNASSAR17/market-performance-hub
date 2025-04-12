
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, decryptData, hashPassword, comparePassword } from '@/utils/encryption';
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
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  users: User[];
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  blockUser: (user: User) => Promise<void>;
  unblockUser: (user: User) => Promise<void>;
  changePassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize the admin user in Supabase if it doesn't exist
  useEffect(() => {
    const initializeAdminUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'lnmr2001@gmail.com')
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create the admin
        const adminEmail = 'lnmr2001@gmail.com';
        const adminPassword = hashPassword('password123');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            name: 'Admin User',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            is_blocked: false
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

  // Improved local storage management
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          const decryptedUser = JSON.parse(decryptData(storedUserData));
          setUser(decryptedUser);
          setIsAuthenticated(!!decryptedUser);
          setIsAdmin(decryptedUser.role === 'admin');
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('user');
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const register = async (name: string, email: string, password: string): Promise<void> => {
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
          is_blocked: false
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      // Auto login after registration
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

  // Modify login method to ensure proper local storage
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
        
        const userToStore = { 
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          isAdmin: data.role === 'admin'
        };
      
        // Ensure robust local storage
        localStorage.setItem('user', encryptData(JSON.stringify(userToStore)));
        
        setUser(userToStore);
        setIsAdmin(data.role === 'admin');
        setIsAuthenticated(true);
        
        navigate('/dashboard');
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userToStore.name}!`,
        });
      } else {
        throw new Error('Invalid credentials');
      }
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

  const logout = () => {
    localStorage.removeItem('user');
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
          is_blocked: updatedUser.isBlocked || false
        })
        .eq('id', updatedUser.id);
      
      if (error) throw error;
      
      // Refresh users list
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      // Update local user if it's the current user
      if (user && user.id === updatedUser.id) {
        const updatedCurrentUser = {
          ...updatedUser,
          role: updatedUser.role || (updatedUser.isAdmin ? 'admin' : 'user')
        };
        localStorage.setItem('user', encryptData(JSON.stringify(updatedCurrentUser)));
        setUser(updatedCurrentUser);
        setIsAdmin(updatedCurrentUser.role === 'admin' || updatedCurrentUser.isAdmin || false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      
      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        isAdmin: user.role === 'admin',
        isBlocked: user.is_blocked
      }));
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
      
      // Refresh users list
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      // Logout if blocked user is current user
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
      
      // Refresh users list
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
    getAllUsers,
    blockUser,
    unblockUser,
    changePassword,
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
