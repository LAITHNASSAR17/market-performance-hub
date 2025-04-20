
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  is_admin?: boolean;
  is_blocked?: boolean;
  subscription_tier?: string;
  email_verified?: boolean;
  avatar_url?: string | null;
  country?: string | null;
}

export interface AuthContextType {
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
