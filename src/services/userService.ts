
import { supabase } from '@/lib/supabase';
import { TradingAccount } from '@/contexts/TradeContext';

export const userService = {
  // Get user's trading accounts
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      // Using a simple query to avoid column ambiguity issues
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching trading accounts:', error);
        throw error;
      }
      
      return data.map(account => ({
        id: account.id,
        userId: account.user_id,
        name: account.name,
        balance: account.balance,
        createdAt: account.created_at
      }));
    } catch (error) {
      console.error('Exception in getTradingAccounts:', error);
      throw error;
    }
  },
  
  // Create a new trading account
  async createTradingAccount(userId: string, name: string, balance: number): Promise<TradingAccount> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!name.trim()) {
      throw new Error('Account name is required');
    }
    
    try {
      // Using a simple query to avoid column ambiguity issues
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: userId,
          name: name,
          balance: balance
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating trading account:', error);
        throw error;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        balance: data.balance,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Exception in createTradingAccount:', error);
      throw error;
    }
  }
};
