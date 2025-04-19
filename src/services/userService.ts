
import { supabase } from '@/lib/supabase';
import { TradingAccount } from '@/contexts/TradeContext';

export const userService = {
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert DB fields to our TradingAccount format
      return (data || []).map(account => ({
        id: account.id,
        userId: account.user_id,
        name: account.name,
        balance: Number(account.balance),
        createdAt: account.created_at
      }));
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      throw error;
    }
  },
  
  async createTradingAccount(userId: string, name: string, balance: number): Promise<TradingAccount> {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: userId,
          name,
          balance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        balance: Number(data.balance),
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating trading account:', error);
      throw error;
    }
  },
  
  async updateTradingAccount(id: string, updates: Partial<Omit<TradingAccount, 'id' | 'userId' | 'createdAt'>>): Promise<TradingAccount> {
    try {
      // Convert our format to DB format
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
      dbUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        balance: Number(data.balance),
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error updating trading account:', error);
      throw error;
    }
  },
  
  async deleteTradingAccount(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('trading_accounts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting trading account:', error);
      throw error;
    }
  }
};
