import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/utils/encryption';
import { User } from '@/types/auth';
import { getUserByEmail, createUserProfile, updateUserProfile } from '@/lib/supabase';

interface AuthContextProps {
  user: User | null;
  userRole: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<User | null>;
  updatePassword: (email: string, newPassword: string) => Promise<boolean>;
  updateProfile: (email: string, name: string, avatar_url: string) => Promise<void>;
  getUserProfile: (email: string) => Promise<User | null>;
  getAllUsers: () => Promise<User[] | null>;
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userRole: 'user',
  isAdmin: false,
  isAuthenticated: false,
  authLoading: false,
  authError: null,
  login: async () => null,
  logout: () => {},
  register: async () => null,
  updatePassword: async () => true,
  updateProfile: async () => {},
  getUserProfile: async () => null,
  getAllUsers: async () => null,
  updateUserRole: async () => {},
  blockUser: async () => {},
  unblockUser: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    sessionStorage.getItem('auth.isAuthenticated') === 'true'
  );
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    // Check if the component is still mounted before setting state
    if (isMounted.current) {
      const storedUser = sessionStorage.getItem('auth.user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserRole(parsedUser.role || 'user');
          setIsAdmin(parsedUser.is_admin || false);
        } catch (error) {
          console.error('Error parsing user from session storage:', error);
          logout();
        }
      }
    }
    
    // Cleanup function when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getUserProfile = async (email: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
      
      if (!data) {
        console.warn('No user data found for email:', email);
        return null;
      }
      
      return data as User;
    } catch (error) {
      console.error('Exception in getUserProfile:', error);
      return null;
    }
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Error fetching all users:', error);
        return null;
      }
      
      return data as User[];
    } catch (error) {
      console.error('Exception in getAllUsers:', error);
      return null;
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
      
      // If the updated user is the current user, update the local state
      if (user && user.id === userId) {
        setUser((prevUser) => prevUser ? { ...prevUser, role: newRole } : null);
        setUserRole(newRole);
        sessionStorage.setItem('auth.user', JSON.stringify({ ...user, role: newRole }));
      }
    } catch (error) {
      console.error('Exception in updateUserRole:', error);
      throw error;
    }
  };

  const blockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: true })
        .eq('id', userId);
      
      if (error) {
        console.error('Error blocking user:', error);
        throw error;
      }
      
      // If the blocked user is the current user, log them out
      if (user && user.id === userId) {
        logout();
      }
    } catch (error) {
      console.error('Exception in blockUser:', error);
      throw error;
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: false })
        .eq('id', userId);
      
      if (error) {
        console.error('Error unblocking user:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in unblockUser:', error);
      throw error;
    }
  };

  const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const hashedPassword = hashPassword(newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword } as any)
        .eq('email', email);
      
      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in updatePassword:', error);
      throw error;
    }
  };

  const updateProfile = async (email: string, name: string, avatar_url: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: name, avatar_url: avatar_url })
        .eq('email', email);
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      // Update local state if the updated profile is the current user
      if (user && user.email === email) {
        const updatedUser = { ...user, name: name, avatar_url: avatar_url };
        setUser(updatedUser);
        sessionStorage.setItem('auth.user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      
      const userProfile = await getUserProfile(email);
      
      if (!userProfile) {
        console.error('User profile not found');
        throw new Error('Invalid credentials');
      }
      
      const hashedPassword = hashPassword(password);
      
      if (userProfile.password !== hashedPassword) {
        console.error('Password mismatch');
        throw new Error('Invalid credentials');
      }
      
      // If user is blocked, prevent login
      if (userProfile.is_blocked) {
        console.error('User is blocked');
        throw new Error('Your account has been blocked. Please contact support.');
      }
      
      // Set user state with the profile data
      setUser(userProfile);
      setUserRole(userProfile.role || 'user');
      setIsAdmin(userProfile.is_admin || false);
      setIsAuthenticated(true);
      setAuthError(null);
      
      // Store user data in session storage
      sessionStorage.setItem('auth.user', JSON.stringify(userProfile));
      sessionStorage.setItem('auth.isAuthenticated', 'true');
      
      return userProfile;
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message || 'An error occurred during login');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setAuthLoading(true);
      
      // Check if the email is already registered
      const existingUser = await getUserProfile(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      const hashedPassword = hashPassword(password);
      const newUser: Partial<User> = {
        email: email,
        name: name,
        password: hashedPassword,
        role: 'user',
        is_admin: false,
        is_blocked: false,
        email_verified: false,
      };
      
      const { data: createdUser, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      
      if (error) {
        console.error('Registration error:', error);
        throw new Error('Registration failed');
      }
      
      if (!createdUser) {
        throw new Error('Could not create user');
      }
      
      // Set user state with the created user data
      setUser(createdUser as User);
      setUserRole(createdUser.role || 'user');
      setIsAdmin(createdUser.is_admin || false);
      setIsAuthenticated(true);
      setAuthError(null);
      
      // Store user data in session storage
      sessionStorage.setItem('auth.user', JSON.stringify(createdUser));
      sessionStorage.setItem('auth.isAuthenticated', 'true');
      
      return createdUser as User;
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || 'An error occurred during registration');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole('user');
    setIsAdmin(false);
    setIsAuthenticated(false);
    setAuthError(null);
    sessionStorage.removeItem('auth.user');
    sessionStorage.removeItem('auth.isAuthenticated');
    navigate('/login');
  };

  const value: AuthContextProps = {
    user,
    userRole,
    isAdmin,
    isAuthenticated,
    authLoading,
    authError,
    login,
    logout,
    register,
    updatePassword,
    updateProfile,
    getUserProfile,
    getAllUsers,
    updateUserRole,
    blockUser,
    unblockUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
