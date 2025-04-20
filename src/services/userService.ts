
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
}

export interface ITradingAccount {
  id: string;
  userId: string;
  name: string;
  balance: number;
  createdAt: string;
}

export const userService = {
  async getUserById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return formatUser(data);
  },

  async getAllUsers(): Promise<IUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error || !data) return [];
    return data.map(formatUser);
  },

  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const now = new Date().toISOString();
    const newUserId = self.crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: newUserId,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        is_blocked: userData.isBlocked,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating user: ${error?.message}`);
    return formatUser(data);
  },

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      updated_at: now
    };
    
    if (userData.name) updateData.name = userData.name;
    if (userData.email) updateData.email = userData.email;
    if (userData.password) updateData.password = userData.password;
    if (userData.role) updateData.role = userData.role;
    if (userData.isBlocked !== undefined) updateData.is_blocked = userData.isBlocked;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatUser(data);
  },

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async findUsersByFilter(filter: Partial<IUser>): Promise<IUser[]> {
    let query = supabase.from('profiles').select('*');
    
    // Map IUser properties to database column names
    const columnMapping: Record<string, string> = {
      isBlocked: 'is_blocked',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
    
    // Apply filters dynamically
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbColumn = columnMapping[key] || key;
        query = query.eq(dbColumn, value);
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
  }
};

function formatUser(data: any): IUser {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password || '',
    role: data.role || 'user',
    isBlocked: data.is_blocked || false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
