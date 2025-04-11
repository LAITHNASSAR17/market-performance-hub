
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getAllUsers: () => StoredUser[];
  deleteUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  updateSystemSettings: (settings: SystemSettings) => void;
  getSystemSettings: () => SystemSettings;
};

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
};

type SystemSettings = {
  platformName: string;
  supportEmail: string;
  passwordPolicy: string;
  sessionTimeout: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add event listener for storage changes to sync across tabs
const STORAGE_EVENT_KEY = 'trading_auth_change';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize system settings if not exists
  const initializeSystemSettings = () => {
    const storedSettings = localStorage.getItem('systemSettings');
    if (!storedSettings) {
      const defaultSettings = {
        platformName: 'Trading Performance Hub',
        supportEmail: 'support@tradingplatform.com',
        passwordPolicy: 'medium',
        sessionTimeout: 60
      };
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    }
  };

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Initialize admin account if not exists
    const users = getUsers();
    if (!users.some(user => user.email === 'admin@example.com')) {
      const adminUser = {
        id: 'admin-' + Date.now().toString(),
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        isAdmin: true
      };
      saveUsers([...users, adminUser]);
    }
    
    // Initialize system settings
    initializeSystemSettings();
    
    // Add storage event listener for cross-tab synchronization
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'currentUser') {
        if (event.newValue) {
          setUser(JSON.parse(event.newValue));
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    setLoading(false);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const getAllUsers = () => {
    return getUsers();
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check demo account
      if (email === 'demo@example.com' && password === 'password') {
        const demoUser = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com'
        };
        setUser(demoUser);
        localStorage.setItem('currentUser', JSON.stringify(demoUser));
        toast({
          title: "Login successful",
          description: "Welcome back to your trading dashboard!",
        });
        return;
      }
      
      // Check registered users
      const users = getUsers();
      const foundUser = users.find(user => user.email === email && user.password === password);
      
      if (foundUser) {
        // Check if user is blocked
        if (foundUser.isBlocked) {
          toast({
            variant: "destructive",
            title: "Account blocked",
            description: "Your account has been blocked by an administrator. Please contact support.",
          });
          throw new Error("Account blocked");
        }
        
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        toast({
          title: "Login successful",
          description: `Welcome back ${userWithoutPassword.isAdmin ? 'Admin' : ''} to your trading dashboard!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Try demo@example.com / password or admin@example.com / admin123",
        });
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check if email already exists
      const users = getUsers();
      if (users.some(user => user.email === email)) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "Email already registered. Please use a different email or login.",
        });
        throw new Error("Email already registered");
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        isAdmin: false
      };
      
      // Save user to "database"
      saveUsers([...users, newUser]);
      
      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An error occurred during registration",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const deleteUser = (userId: string) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only administrators can delete users",
      });
      return;
    }
    
    try {
      const users = getUsers();
      const updatedUsers = users.filter(user => user.id !== userId);
      saveUsers(updatedUsers);
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    }
  };

  const blockUser = (userId: string) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only administrators can block users",
      });
      return;
    }
    
    try {
      const users = getUsers();
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, isBlocked: true };
        }
        return user;
      });
      
      saveUsers(updatedUsers);
      
      toast({
        title: "User blocked",
        description: "User has been blocked successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to block user",
      });
    }
  };
  
  const unblockUser = (userId: string) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only administrators can unblock users",
      });
      return;
    }
    
    try {
      const users = getUsers();
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, isBlocked: false };
        }
        return user;
      });
      
      saveUsers(updatedUsers);
      
      toast({
        title: "User unblocked",
        description: "User has been unblocked successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unblock user",
      });
    }
  };

  const updateSystemSettings = (settings: SystemSettings) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only administrators can update system settings",
      });
      return;
    }
    
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings updated",
        description: "System settings have been updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update system settings",
      });
    }
  };
  
  const getSystemSettings = (): SystemSettings => {
    const settings = localStorage.getItem('systemSettings');
    if (settings) {
      return JSON.parse(settings);
    }
    
    // Return default settings if not found
    return {
      platformName: 'Trading Performance Hub',
      supportEmail: 'support@tradingplatform.com',
      passwordPolicy: 'medium',
      sessionTimeout: 60
    };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin: !!user?.isAdmin,
      login, 
      register, 
      logout,
      loading,
      getAllUsers,
      deleteUser,
      blockUser,
      unblockUser,
      updateSystemSettings,
      getSystemSettings
    }}>
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
