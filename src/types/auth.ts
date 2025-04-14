export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  role?: string;
  subscription_tier?: string;
}

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  users: User[];
}

export interface AuthContextType extends AuthState {
  register: (name: string, email: string, password: string) => Promise<void>;
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
}

export interface ExtendedTrade extends Trade {
  // UI specific fields
  account?: string;
  pair?: string;
  type?: 'Buy' | 'Sell';
  entry?: number;
  exit?: number;
  lotSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskPercentage?: number;
  returnPercentage?: number;
  durationMinutes?: number;
  date?: string;
  hashtags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
