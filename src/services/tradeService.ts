
import { supabase } from '@/lib/supabase';
import { Trade } from '@/types/trade';

export interface ITrade {
  id: string;
  user_id: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  direction: string;
  entry_date: string;
  exit_date: string | null;
  profit_loss: number;
  fees: number;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  rating?: number;
  stop_loss?: number;
  take_profit?: number;
  duration_minutes?: number;
  playbook?: string;
  followed_rules?: string[];
  market_session?: string;
  account_id?: string;
  risk_percentage?: number;
  return_percentage?: number;
}

export const tradeService = {
  async getTradeById(id: string): Promise<ITrade> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching trade:', error);
      throw error;
    }
  },
  
  async getAllTrades(): Promise<ITrade[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }
  },
  
  async createTrade(tradeData: Omit<ITrade, 'id' | 'created_at' | 'updated_at'>): Promise<{data: ITrade | null, error: any}> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          ...tradeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      console.error('Error creating trade:', error);
      return { data: null, error };
    }
  },
  
  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<{data: ITrade | null, error: any}> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .update({
          ...tradeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      console.error('Error updating trade:', error);
      return { data: null, error };
    }
  },
  
  async deleteTrade(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);
        
      return { error };
    } catch (error) {
      console.error('Error deleting trade:', error);
      return { error };
    }
  },
  
  async findTradesByFilter(filter: Partial<ITrade>): Promise<ITrade[]> {
    try {
      let query = supabase.from('trades').select('*');
      
      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding trades by filter:', error);
      throw error;
    }
  }
};
