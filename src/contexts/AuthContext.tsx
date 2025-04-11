import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { encryptData, decryptData, hashPassword, comparePassword } from '@/utils/encryption';

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
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  getUserDetails: (userId: string) => UserDetails | null;
};

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  resetPasswordCode?: string;
  resetPasswordExpiry?: number;
  lastLogin?: string;
  createdAt: string;
  loginAttempts?: number;
};

type UserDetails = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  lastLogin?: string;
  createdAt: string;
  loginHistory: LoginRecord[];
};

type LoginRecord = {
  timestamp: string;
  success: boolean;
  ipAddress?: string;
};

type SystemSettings = {
  platformName: string;
  supportEmail: string;
  passwordPolicy: string;
  sessionTimeout: number;
  dataEncryption: boolean;
  maxLoginAttempts: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add event keys for storage changes to sync across tabs
const STORAGE_EVENT_KEYS = {
  CURRENT_USER: 'currentUser',
  USERS: 'users',
  SYSTEM_SETTINGS: 'systemSettings',
  LOGIN_HISTORY: 'loginHistory'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize system settings if not exists
  const initializeSystemSettings = () => {
    const storedSettings = localStorage.getItem(STORAGE_EVENT_KEYS.SYSTEM_SETTINGS);
    if (!storedSettings) {
      const defaultSettings = {
        platformName: 'Trading Performance Hub',
        supportEmail: 'support@tradingplatform.com',
        passwordPolicy: 'medium',
        sessionTimeout: 60,
        dataEncryption: true,
        maxLoginAttempts: 5
      };
      localStorage.setItem(STORAGE_EVENT_KEYS.SYSTEM_SETTINGS, JSON.stringify(defaultSettings));
    }
  };

  // Initialize demo and admin accounts if they don't exist
  const initializeDefaultAccounts = () => {
    const users = getUsers();
    let usersChanged = false;

    // Check for admin account
    if (!users.some(user => user.email === 'admin@example.com')) {
      users.push({
        id: 'admin-' + Date.now().toString(),
        name: 'Admin',
        email: 'admin@example.com',
        password: hashPassword('admin123'),
        isAdmin: true,
        createdAt: new Date().toISOString()
      });
      usersChanged = true;
    } else {
      // Update existing admin account to use hashed password
      const adminIndex = users.findIndex(user => user.email === 'admin@example.com');
      if (adminIndex !== -1 && !users[adminIndex].password.startsWith('0x')) {
        users[adminIndex].password = hashPassword('admin123');
        usersChanged = true;
      }
    }

    // Check for demo account
    if (!users.some(user => user.email === 'demo@example.com')) {
      users.push({
        id: 'demo-' + Date.now().toString(),
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashPassword('password'),
        createdAt: new Date().toISOString()
      });
      usersChanged = true;
    } else {
      // Update existing demo account to use hashed password
      const demoIndex = users.findIndex(user => user.email === 'demo@example.com');
      if (demoIndex !== -1 && !users[demoIndex].password.startsWith('0x')) {
        users[demoIndex].password = hashPassword('password');
        usersChanged = true;
      }
    }

    if (usersChanged) {
      saveUsers(users);
    }
  };

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem(STORAGE_EVENT_KEYS.CURRENT_USER);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Initialize default accounts
    initializeDefaultAccounts();
    
    // Initialize system settings
    initializeSystemSettings();
    
    // Add storage event listener for cross-tab synchronization
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_EVENT_KEYS.CURRENT_USER) {
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
    const users = localStorage.getItem(STORAGE_EVENT_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(STORAGE_EVENT_KEYS.USERS, JSON.stringify(users));
  };

  const getAllUsers = () => {
    // Admin can see all user data
    if (user?.isAdmin) {
      return getUsers();
    }
    
    // Non-admin users only see limited user data
    const users = getUsers();
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      isBlocked: u.isBlocked,
      createdAt: u.createdAt
    }));
  };

  const getUserDetails = (userId: string): UserDetails | null => {
    // Only admin can access full user details
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "الوصول مرفوض",
        description: "فقط المسؤولون يمكنهم الوصول إلى تفاصيل المستخدم",
      });
      return null;
    }
    
    const users = getUsers();
    const foundUser = users.find(u => u.id === userId);
    
    if (!foundUser) {
      return null;
    }
    
    // Get login history for user (if implemented)
    const loginHistory = getLoginHistory(userId);
    
    return {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      isAdmin: foundUser.isAdmin,
      isBlocked: foundUser.isBlocked,
      lastLogin: foundUser.lastLogin,
      createdAt: foundUser.createdAt,
      loginHistory: loginHistory || []
    };
  };

  const getLoginHistory = (userId: string): LoginRecord[] => {
    const historyData = localStorage.getItem(STORAGE_EVENT_KEYS.LOGIN_HISTORY);
    if (!historyData) return [];
    
    const allHistory = JSON.parse(historyData);
    return allHistory[userId] || [];
  };

  const addLoginRecord = (userId: string, success: boolean) => {
    const historyData = localStorage.getItem(STORAGE_EVENT_KEYS.LOGIN_HISTORY);
    const allHistory = historyData ? JSON.parse(historyData) : {};
    
    if (!allHistory[userId]) {
      allHistory[userId] = [];
    }
    
    // Add new login record
    allHistory[userId].push({
      timestamp: new Date().toISOString(),
      success: success
    });
    
    // Keep only last 50 records
    if (allHistory[userId].length > 50) {
      allHistory[userId] = allHistory[userId].slice(-50);
    }
    
    localStorage.setItem(STORAGE_EVENT_KEYS.LOGIN_HISTORY, JSON.stringify(allHistory));
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Get system settings
      const settings = getSystemSettings();
      
      // Check registered users
      const users = getUsers();
      const foundUser = users.find(user => user.email === email);
      
      if (!foundUser) {
        // Don't reveal if user exists or not
        toast({
          variant: "destructive",
          title: "فشل تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
        addLoginRecord(email, false);
        throw new Error("Invalid credentials");
      }
      
      // Check if user is blocked
      if (foundUser.isBlocked) {
        toast({
          variant: "destructive",
          title: "الحساب محظور",
          description: "تم حظر حسابك من قبل المسؤول. يرجى الاتصال بالدعم.",
        });
        addLoginRecord(foundUser.id, false);
        throw new Error("Account blocked");
      }
      
      // Check login attempts
      if (foundUser.loginAttempts && foundUser.loginAttempts >= settings.maxLoginAttempts) {
        // Auto-block account if max attempts reached
        foundUser.isBlocked = true;
        saveUsers(users);
        
        toast({
          variant: "destructive",
          title: "الحساب محظور",
          description: "تم حظر الحساب بسبب محاولات تسجيل دخول متعددة فاشلة",
        });
        addLoginRecord(foundUser.id, false);
        throw new Error("Account blocked due to too many failed attempts");
      }
      
      // Verify password
      const passwordMatches = comparePassword(password, foundUser.password);
      
      if (!passwordMatches) {
        // Increment failed login attempts
        foundUser.loginAttempts = (foundUser.loginAttempts || 0) + 1;
        saveUsers(users);
        
        toast({
          variant: "destructive",
          title: "فشل تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
        addLoginRecord(foundUser.id, false);
        throw new Error("Invalid credentials");
      }
      
      // Login successful, reset login attempts and update last login
      foundUser.loginAttempts = 0;
      foundUser.lastLogin = new Date().toISOString();
      saveUsers(users);
      
      // Create user object without sensitive information
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بعودتك ${userWithoutPassword.isAdmin ? 'مسؤول' : ''} إلى لوحة التحكم!`,
      });
      
      addLoginRecord(foundUser.id, true);
    } catch (error) {
      // Toast notifications are handled in the code above
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
          title: "فشل التسجيل",
          description: "البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني مختلف أو تسجيل الدخول.",
        });
        throw new Error("Email already registered");
      }
      
      // Hash password before storing
      const hashedPassword = hashPassword(password);
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        loginAttempts: 0
      };
      
      // Save user to "database"
      saveUsers([...users, newUser]);
      
      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم إنشاء حسابك!",
      });
    } catch (error) {
      // Toast is already handled above
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
  };

  const deleteUser = (userId: string) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "الإذن مرفوض",
        description: "فقط المسؤولون يمكنهم حذف المستخدمين",
      });
      return;
    }
    
    try {
      const users = getUsers();
      const updatedUsers = users.filter(user => user.id !== userId);
      saveUsers(updatedUsers);
      
      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح",
      });
      
      // Dispatch a custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('user-database-changed'));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف المستخدم",
      });
    }
  };

  const blockUser = (userId: string) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "الإذن مرفوض",
        description: "فقط المسؤولون يمكنهم حظر المستخدمين",
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
        title: "تم حظر المستخدم",
        description: "تم حظر المستخدم بنجاح",
      });
      
      // Dispatch a custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('user-database-changed'));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حظر المستخدم",
      });
    }
  };
  
  const unblockUser = (userId: string) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "الإذن مرفوض",
        description: "فقط المسؤولون يمكنهم إلغاء حظر المستخدمين",
      });
      return;
    }
    
    try {
      const users = getUsers();
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, isBlocked: false, loginAttempts: 0 };
        }
        return user;
      });
      
      saveUsers(updatedUsers);
      
      toast({
        title: "تم إلغاء حظر المستخدم",
        description: "تم إلغاء حظر المستخدم بنجاح",
      });
      
      // Dispatch a custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('user-database-changed'));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إلغاء حظر المستخدم",
      });
    }
  };

  const updateSystemSettings = (settings: SystemSettings) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast({
        variant: "destructive",
        title: "الإذن مرفوض",
        description: "فقط المسؤولون يمكنهم تحديث إعدادات النظام",
      });
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_EVENT_KEYS.SYSTEM_SETTINGS, JSON.stringify(settings));
      
      toast({
        title: "تم تحديث الإعدادات",
        description: "تم تحديث إعدادات النظام بنجاح",
      });
      
      // Dispatch a custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('system-settings-changed'));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحديث إعدادات النظام",
      });
    }
  };
  
  const getSystemSettings = (): SystemSettings => {
    const settings = localStorage.getItem(STORAGE_EVENT_KEYS.SYSTEM_SETTINGS);
    if (settings) {
      return JSON.parse(settings);
    }
    
    // Return default settings if not found
    return {
      platformName: 'Trading Performance Hub',
      supportEmail: 'support@tradingplatform.com',
      passwordPolicy: 'medium',
      sessionTimeout: 60,
      dataEncryption: true,
      maxLoginAttempts: 5
    };
  };

  // Generate a random 6-digit code
  const generateResetCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send password reset email (simulated)
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Check if email exists
      const users = getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "البريد الإلكتروني غير موجود",
          description: "لا يوجد حساب مسجل بهذا البريد الإلكتروني.",
        });
        throw new Error("Email not found");
      }
      
      // Generate reset code and set expiry (1 hour from now)
      const resetCode = generateResetCode();
      const resetExpiry = Date.now() + 3600000; // 1 hour
      
      // Update user with reset code
      const updatedUsers = users.map(u => {
        if (u.email === email) {
          return {
            ...u,
            resetPasswordCode: resetCode,
            resetPasswordExpiry: resetExpiry
          };
        }
        return u;
      });
      
      saveUsers(updatedUsers);
      
      // Simulate sending email
      console.log(`رمز إعادة التعيين للبريد ${email}: ${resetCode}`);
      
      toast({
        title: "تم إرسال رمز إعادة التعيين",
        description: "تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. لأغراض العرض التوضيحي، تحقق من سجل وحدة التحكم.",
      });
    } catch (error) {
      // Don't show error toast here as it's already handled
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with code
  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Check if email exists
      const users = getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "البريد الإلكتروني غير موجود",
          description: "لا يوجد حساب مسجل بهذا البريد الإلكتروني.",
        });
        throw new Error("Email not found");
      }
      
      // Check if reset code is valid and not expired
      if (
        !user.resetPasswordCode || 
        user.resetPasswordCode !== resetCode ||
        !user.resetPasswordExpiry ||
        user.resetPasswordExpiry < Date.now()
      ) {
        toast({
          variant: "destructive",
          title: "رمز غير صالح أو منتهي الصلاحية",
          description: "رمز إعادة التعيين غير صالح أو انتهت صلاحيته. يرجى طلب رمز جديد.",
        });
        throw new Error("Invalid or expired code");
      }
      
      // Hash the new password
      const hashedPassword = hashPassword(newPassword);
      
      // Update user password and clear reset code
      const updatedUsers = users.map(u => {
        if (u.email === email) {
          return {
            ...u,
            password: hashedPassword,
            resetPasswordCode: undefined,
            resetPasswordExpiry: undefined
          };
        }
        return u;
      });
      
      saveUsers(updatedUsers);
      
      toast({
        title: "تم إعادة تعيين كلمة المرور بنجاح",
        description: "تم تحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
      });
    } catch (error) {
      // Don't show error toast here as it's already handled
      throw error;
    } finally {
      setLoading(false);
    }
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
      getSystemSettings,
      forgotPassword,
      resetPassword,
      getUserDetails
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
