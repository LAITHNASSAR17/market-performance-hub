
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
};

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    
    setLoading(false);
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin: !!user?.isAdmin,
      login, 
      register, 
      logout,
      loading,
      getAllUsers
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
