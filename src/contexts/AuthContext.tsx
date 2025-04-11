import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, decryptData, hashPassword, comparePassword } from '@/utils/encryption';

interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password should be optional here
  isAdmin?: boolean;
  isBlocked?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  getAllUsers: () => User[];
  blockUser: (user: User) => Promise<void>;
  unblockUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Extend the User interface to include encrypted data
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
  const navigate = useNavigate();

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

    const users = getAllUsers();
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    await login(email, password); // Automatically log in the user after registration
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    const users = getAllUsers();
    const user = users.find(user => user.email === email);

    if (user && user.password && comparePassword(password, user.password)) {
      if (user.isBlocked) {
        setLoading(false);
        throw new Error('User is blocked');
      }
      const decryptedUser = { ...user, name: decryptData(user.encryptedName), email: decryptData(user.encryptedEmail) };
      localStorage.setItem('user', encryptData(JSON.stringify(decryptedUser)));
      setUser(decryptedUser);
      setIsAdmin(user.isAdmin || false);
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
    // In a real application, you would send a reset code to the user's email
    console.log(`Forgot password requested for ${email}`);
    // Here, we'll just store a reset code in localStorage for simplicity
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
    localStorage.setItem(`resetCode_${email}`, resetCode);
    alert(`Reset code: ${resetCode}. This should be sent to the user's email in a real app.`);
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<void> => {
    const storedResetCode = localStorage.getItem(`resetCode_${email}`);
    if (storedResetCode === resetCode) {
      const hashedPassword = hashPassword(newPassword);
      const users = getAllUsers();
      const userIndex = users.findIndex(user => user.email === email);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], password: hashedPassword };
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.removeItem(`resetCode_${email}`);
        alert('Password reset successfully');
        navigate('/login');
      } else {
        throw new Error('User not found');
      }
    } else {
      throw new Error('Invalid reset code');
    }
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === updatedUser.id);
    if (userIndex !== -1) {
      // Encrypt name and email before storing
      const encryptedName = encryptData(updatedUser.name);
      const encryptedEmail = encryptData(updatedUser.email);

      users[userIndex] = {
        ...users[userIndex],
        name: updatedUser.name,
        email: updatedUser.email,
        encryptedName: encryptedName,
        encryptedEmail: encryptedEmail,
        isAdmin: updatedUser.isAdmin,
        isBlocked: updatedUser.isBlocked,
      };
      localStorage.setItem('users', JSON.stringify(users));

      // If the updated user is the currently logged-in user, update the stored user data
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

  // نقوم بتحديث نوع البيانات والوظيفة التي تستخدمها
  const getAllUsers = (): StoredUser[] => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.map((user: any) => {
        // التأكد من أن كل المستخدمين لديهم حقل كلمة المرور
        return {
          ...user,
          password: user.password || '' // استخدام قيمة افتراضية إذا كانت غير موجودة
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const blockUser = async (user: User): Promise<void> => {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], isBlocked: true };
      localStorage.setItem('users', JSON.stringify(users));
      // If the blocked user is the currently logged-in user, log them out
      if (user.id === this.user?.id) {
        logout();
      }
    } else {
      throw new Error('User not found');
    }
  };

  const unblockUser = async (user: User): Promise<void> => {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], isBlocked: false };
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      throw new Error('User not found');
    }
  };

  const value = {
    user,
    isAdmin,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    getAllUsers,
    blockUser,
    unblockUser,
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
