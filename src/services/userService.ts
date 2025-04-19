import { supabase } from '@/lib/supabase';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriptionTier?: string;
}

export interface ITradingAccount {
  id: string;
  userId: string;
  name: string;
  balance: number;
  createdAt: string;
}

export interface IUserProfile {
  id: string;
  userId: string;
  country?: string;
  avatar_url?: string;
  updatedAt: string;
  createdAt: string;
}

export const userService = {
  async getUserById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase.auth.admin.getUserById(id);
    
    if (error || !data.user) return null;
    return formatUser(data.user);
  },

  async getAllUsers(): Promise<IUser[]> {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error || !data.users) return [];
    return data.users.map(formatUser);
  },

  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role,
        is_blocked: userData.isBlocked,
        subscription_tier: userData.subscriptionTier || 'free'
      }
    });
    
    if (error || !data.user) throw new Error(`Error creating user: ${error?.message}`);
    return formatUser(data.user);
  },

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const userMetadata: Record<string, any> = {};
    if (userData.name !== undefined) userMetadata.name = userData.name;
    if (userData.role !== undefined) userMetadata.role = userData.role;
    if (userData.isBlocked !== undefined) userMetadata.is_blocked = userData.isBlocked;
    if (userData.subscriptionTier !== undefined) userMetadata.subscription_tier = userData.subscriptionTier;

    const { data, error } = await supabase.auth.admin.updateUserById(
      id,
      { user_metadata: userMetadata }
    );
    
    if (error || !data.user) return null;
    return formatUser(data.user);
  },

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.auth.admin.deleteUser(id);
    return !error;
  },

  async findUsersByFilter(filter: Partial<IUser>): Promise<IUser[]> {
    let query = supabase.from('users').select('*');
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error || !data) return [];
    return data.map(formatUser);
  },
  
  async createTradingAccount(userId: string, name: string, balance: number): Promise<ITradingAccount> {
    if (!userId) {
      throw new Error('User ID is required to create a trading account');
    }
    
    if (!name || name.trim() === '') {
      throw new Error('Account name is required');
    }
    
    const parsedBalance = Number(balance) || 0;
    
    const { data, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: userId,
        name: name.trim(),
        balance: parsedBalance
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating trading account:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create trading account, no data returned');
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      balance: Number(data.balance),
      createdAt: data.created_at
    };
  },
  
  async getTradingAccounts(userId: string): Promise<ITradingAccount[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch trading accounts');
    }
    
    const { data, error } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching trading accounts:', error);
      return [];
    }
    
    if (!data) return [];
    
    return data.map(account => ({
      id: account.id,
      userId: account.user_id,
      name: account.name,
      balance: Number(account.balance),
      createdAt: account.created_at
    }));
  },

  async getUserProfile(userId: string): Promise<IUserProfile | null> {
    if (!userId) {
      throw new Error('User ID is required to fetch user profile');
    }
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      userId: data.user_id,
      country: 'Unknown',
      avatar_url: '',
      updatedAt: data.updated_at,
      createdAt: data.updated_at
    };
  },
  
  async updateUserProfile(userId: string, profileData: Partial<IUserProfile>): Promise<IUserProfile | null> {
    if (!userId) {
      throw new Error('User ID is required to update user profile');
    }
    
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      userId: data.user_id,
      country: profileData.country || 'Unknown',
      avatar_url: profileData.avatar_url || '',
      updatedAt: data.updated_at,
      createdAt: data.updated_at
    };
  }
};

function formatUser(data: any): IUser {
  return {
    id: data.id,
    name: data.user_metadata?.name || '',
    email: data.email,
    password: '',
    role: data.user_metadata?.role || 'user',
    isBlocked: data.user_metadata?.is_blocked || false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at || data.created_at),
    subscriptionTier: data.user_metadata?.subscription_tier || 'free'
  };
}
