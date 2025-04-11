
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, decryptData, hashPassword, comparePassword } from '@/utils/encryption';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  encryptedName?: string;
  encryptedEmail?: string;
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
  getAllUsers: () => User[];
  blockUser: (user: User) => Promise<void>;
  unblockUser: (user: User) => Promise<void>;
  changePassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

interface StoredUser extends User {
  encryptedName: string;
  encryptedEmail: string;
  password?: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const decryptedUser = JSON.parse(decryptData(storedUser));
        setUser(decryptedUser);
        setIsAuthenticated(true);
        setIsAdmin(decryptedUser.isAdmin || false);
      } catch (error) {
        console.error('Error decrypting user data:', error);
        localStorage.removeItem('user');
      }
    }
    
    const allUsers = getAllUsers();
    setUsers(allUsers);
    
    setLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    const hashedPassword = hashPassword(password);
    const encryptedName = encryptData(name);
    const encryptedEmail = encryptData(email);
    const newUser: StoredUser = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      email,
      password: hashedPassword,
      encryptedName,
      encryptedEmail,
      isAdmin: false,
      isBlocked: false,
    };

    const allUsers = getAllUsers();
    allUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(allUsers));
    setUsers(allUsers);
    await login(email, password);
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    const allUsers = getAllUsers();
    const foundUser = allUsers.find(user => user.email === email);

    if (foundUser && foundUser.password && comparePassword(password, foundUser.password)) {
      if (foundUser.isBlocked) {
        setLoading(false);
        throw new Error('User is blocked');
      }
      const decryptedUser = { 
        ...foundUser, 
        name: foundUser.encryptedName ? decryptData(foundUser.encryptedName) : foundUser.name, 
        email: foundUser.encryptedEmail ? decryptData(foundUser.encryptedEmail) : foundUser.email 
      };
      localStorage.setItem('user', encryptData(JSON.stringify(decryptedUser)));
      setUser(decryptedUser);
      setIsAdmin(foundUser.isAdmin || false);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } else {
      setLoading(false);
      throw new Error('Invalid credentials');
    }
    setLoading(false);
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
      const allUsers = getAllUsers();
      const userIndex = allUsers.findIndex(user => user.email === email);
      if (userIndex !== -1) {
        allUsers[userIndex] = { ...allUsers[userIndex], password: hashedPassword };
        localStorage.setItem('users', JSON.stringify(allUsers));
        setUsers(allUsers);
        localStorage.removeItem(`resetCode_${email}`);
        toast({
          title: "Success",
          description: "Password reset successfully",
        });
        navigate('/login');
      } else {
        throw new Error('User not found');
      }
    } else {
      throw new Error('Invalid reset code');
    }
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(user => user.id === updatedUser.id);
    if (userIndex !== -1) {
      const encryptedName = encryptData(updatedUser.name);
      const encryptedEmail = encryptData(updatedUser.email);

      allUsers[userIndex] = {
        ...allUsers[userIndex],
        name: updatedUser.name,
        email: updatedUser.email,
        encryptedName: encryptedName,
        encryptedEmail: encryptedEmail,
        isAdmin: updatedUser.isAdmin,
        isBlocked: updatedUser.isBlocked,
      };
      localStorage.setItem('users', JSON.stringify(allUsers));
      setUsers(allUsers);

      if (user && user.id === updatedUser.id) {
        const decryptedUser = { ...updatedUser, name: updatedUser.name, email: updatedUser.email };
        localStorage.setItem('user', encryptData(JSON.stringify(decryptedUser)));
        setUser(decryptedUser);
        setIsAdmin(updatedUser.isAdmin || false);
      }
    } else {
      throw new Error('User not found');
    }
  };

  const getAllUsers = (): User[] => {
    try {
      const storedUsers = localStorage.getItem('users');
      if (!storedUsers) return [];
      
      const parsedUsers = JSON.parse(storedUsers);
      return parsedUsers.map((user: any) => {
        return {
          ...user,
          password: user.password || ''
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const blockUser = async (user: User): Promise<void> => {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = { ...allUsers[userIndex], isBlocked: true };
      localStorage.setItem('users', JSON.stringify(allUsers));
      setUsers(allUsers);
      
      if (user.id === user?.id) {
        logout();
      }
    } else {
      throw new Error('User not found');
    }
  };

  const unblockUser = async (user: User): Promise<void> => {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = { ...allUsers[userIndex], isBlocked: false };
      localStorage.setItem('users', JSON.stringify(allUsers));
      setUsers(allUsers);
    } else {
      throw new Error('User not found');
    }
  };

  const changePassword = async (email: string, newPassword: string): Promise<void> => {
    const hashedPassword = hashPassword(newPassword);
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(user => user.email === email);
    
    if (userIndex !== -1) {
      allUsers[userIndex] = { ...allUsers[userIndex], password: hashedPassword };
      localStorage.setItem('users', JSON.stringify(allUsers));
      setUsers(allUsers);
      toast({
        title: "Success", 
        description: "Password changed successfully"
      });
    } else {
      throw new Error('User not found');
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
