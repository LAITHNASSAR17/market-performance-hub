
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
  accountType?: string;
  broker?: string;
  accountNumber?: string;
}

export const userService = {
  async getUserById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return formatUser(data);
  },

  async getAllUsers(): Promise<IUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !data) return [];
    return data.map(formatUser);
  },

  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
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
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatUser(data);
  },

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async findUsersByFilter(filter: Partial<IUser>): Promise<IUser[]> {
    let query = supabase.from('users').select('*');
    
    // Apply filters dynamically
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error || !data) return [];
    return data.map(formatUser);
  },
  
  async createTradingAccount(userId: string, name: string, balance: number, accountType: string = 'live'): Promise<ITradingAccount> {
    if (!userId) {
      throw new Error('User ID is required to create a trading account');
    }
    
    if (!name || name.trim() === '') {
      throw new Error('Account name is required');
    }
    
    const parsedBalance = Number(balance) || 0;
    
    try {
      console.log('Creating trading account with params:', { userId, name, balance: parsedBalance, accountType });
      
      // Create the account directly
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: userId,
          name: name.trim(),
          balance: parsedBalance,
          account_type: accountType,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Supabase error creating trading account:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create trading account, no data returned');
      }
      
      const account = data[0];
      console.log('Created account:', account);
      
      return {
        id: account.id,
        userId: account.user_id,
        name: account.name,
        balance: Number(account.balance),
        createdAt: account.created_at,
        accountType: account.account_type
      };
    } catch (error) {
      console.error('Detailed error in createTradingAccount:', error);
      throw error;
    }
  },
  
  async getTradingAccounts(userId: string): Promise<ITradingAccount[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch trading accounts');
    }
    
    try {
      console.log('Fetching trading accounts for user:', userId);
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching trading accounts:', error);
        return [];
      }
      
      if (!data) return [];
      
      console.log('Trading accounts data from DB:', data);
      
      return data.map(account => ({
        id: account.id,
        userId: account.user_id,
        name: account.name,
        balance: Number(account.balance),
        createdAt: account.created_at,
        accountType: account.account_type,
        broker: account.broker,
        accountNumber: account.account_number
      }));
    } catch (error) {
      console.error('Detailed error in getTradingAccounts:', error);
      return [];
    }
  }
};

function formatUser(data: any): IUser {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
    isBlocked: data.is_blocked || false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
