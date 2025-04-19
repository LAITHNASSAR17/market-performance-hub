
import { supabase } from '@/lib/supabase';

export interface ITrade {
  id: string;
  user_id: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  direction: 'long' | 'short';
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
  before_image_url?: string;
  after_image_url?: string;
  image_url?: string;
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
      
      // Ensure direction is correct type
      const tradeData = data as any;
      if (tradeData.direction !== 'long' && tradeData.direction !== 'short') {
        tradeData.direction = tradeData.direction === 'Buy' ? 'long' : 'short';
      }
      
      return tradeData as ITrade;
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
      
      // Ensure directions are correct type
      const tradesData = (data || []).map((trade: any) => {
        if (trade.direction !== 'long' && trade.direction !== 'short') {
          trade.direction = trade.direction === 'Buy' ? 'long' : 'short';
        }
        return trade as ITrade;
      });
      
      return tradesData;
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }
  },
  
  async createTrade(tradeData: Omit<ITrade, 'id' | 'created_at' | 'updated_at'>): Promise<{data: ITrade | null, error: any}> {
    try {
      // Ensure direction is correct type
      if (tradeData.direction !== 'long' && tradeData.direction !== 'short') {
        (tradeData as any).direction = tradeData.direction === 'Buy' ? 'long' : 'short';
      }
      
      const { data, error } = await supabase
        .from('trades')
        .insert({
          ...tradeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (data) {
        // Ensure direction is correct type for returned data
        const tradeResult = data as any;
        if (tradeResult.direction !== 'long' && tradeResult.direction !== 'short') {
          tradeResult.direction = tradeResult.direction === 'Buy' ? 'long' : 'short';
        }
        return { data: tradeResult as ITrade, error };
      }
      
      return { data: null, error };
    } catch (error) {
      console.error('Error creating trade:', error);
      return { data: null, error };
    }
  },
  
  async updateTrade(id: string, tradeData: Partial<Omit<ITrade, 'id' | 'created_at' | 'user_id'>>): Promise<{data: ITrade | null, error: any}> {
    try {
      // Ensure direction is correct type if provided
      if (tradeData.direction && tradeData.direction !== 'long' && tradeData.direction !== 'short') {
        (tradeData as any).direction = tradeData.direction === 'Buy' ? 'long' : 'short';
      }
      
      const { data, error } = await supabase
        .from('trades')
        .update({
          ...tradeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (data) {
        // Ensure direction is correct type for returned data
        const tradeResult = data as any;
        if (tradeResult.direction !== 'long' && tradeResult.direction !== 'short') {
          tradeResult.direction = tradeResult.direction === 'Buy' ? 'long' : 'short';
        }
        return { data: tradeResult as ITrade, error };
      }
      
      return { data: null, error };
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
  
  async findTradesByFilter(filter: Record<string, any>): Promise<ITrade[]> {
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
      
      // Ensure directions are correct type
      const tradesData = (data || []).map((trade: any) => {
        if (trade.direction !== 'long' && trade.direction !== 'short') {
          trade.direction = trade.direction === 'Buy' ? 'long' : 'short';
        }
        return trade as ITrade;
      });
      
      return tradesData;
    } catch (error) {
      console.error('Error finding trades by filter:', error);
      throw error;
    }
  }
};
