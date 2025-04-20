
import { supabase } from '@/lib/supabase';

export interface ITrade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  direction: 'long' | 'short';
  entryDate: Date;
  exitDate: Date | null;
  profitLoss: number | null;
  fees: number;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  stopLoss: number | null;
  takeProfit: number | null;
  durationMinutes: number | null;
  playbook?: string;
  followedRules?: string[];
  marketSession?: string;
}

export const tradeService = {
  async getTradeById(id: string): Promise<ITrade | null> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        console.error('Error fetching trade:', error);
        return null;
      }
      
      return formatTrade(data);
    } catch (err) {
      console.error('Error in getTradeById:', err);
      return null;
    }
  },

  async getAllTrades(): Promise<ITrade[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*');
      
      if (error || !data) {
        console.error('Error fetching trades:', error);
        return [];
      }
      
      return data.map(formatTrade);
    } catch (err) {
      console.error('Error in getAllTrades:', err);
      return [];
    }
  },

  async createTrade(tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITrade> {
    try {
      // Format entry and exit dates correctly
      const entryDateIso = tradeData.entryDate instanceof Date 
        ? tradeData.entryDate.toISOString() 
        : new Date(tradeData.entryDate).toISOString();
      
      const exitDateIso = tradeData.exitDate instanceof Date 
        ? tradeData.exitDate?.toISOString() 
        : tradeData.exitDate ? new Date(tradeData.exitDate).toISOString() : null;

      const { data, error } = await supabase
        .from('trades')
        .insert({
          symbol: tradeData.symbol,
          user_id: tradeData.userId,
          entry_price: tradeData.entryPrice,
          exit_price: tradeData.exitPrice,
          quantity: tradeData.quantity,
          direction: tradeData.direction,
          entry_date: entryDateIso,
          exit_date: exitDateIso,
          profit_loss: tradeData.profitLoss,
          fees: tradeData.fees || 0,
          notes: tradeData.notes || '',
          tags: tradeData.tags || [],
          rating: tradeData.rating || 0,
          stop_loss: tradeData.stopLoss,
          take_profit: tradeData.takeProfit,
          duration_minutes: tradeData.durationMinutes,
          playbook: tradeData.playbook,
          followed_rules: tradeData.followedRules || [],
          market_session: tradeData.marketSession
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating trade:', error);
        throw new Error(`Error creating trade: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned after creating trade');
      }
      
      return formatTrade(data);
    } catch (error: any) {
      console.error('Error in createTrade:', error);
      throw error;
    }
  },

  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
    try {
      const updateObject: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (tradeData.symbol !== undefined) updateObject.symbol = tradeData.symbol;
      if (tradeData.entryPrice !== undefined) updateObject.entry_price = tradeData.entryPrice;
      if (tradeData.exitPrice !== undefined) updateObject.exit_price = tradeData.exitPrice;
      if (tradeData.quantity !== undefined) updateObject.quantity = tradeData.quantity;
      if (tradeData.direction !== undefined) updateObject.direction = tradeData.direction;
      
      if (tradeData.entryDate !== undefined) {
        updateObject.entry_date = tradeData.entryDate instanceof Date 
          ? tradeData.entryDate.toISOString() 
          : new Date(tradeData.entryDate).toISOString();
      }
      
      if (tradeData.exitDate !== undefined) {
        updateObject.exit_date = tradeData.exitDate instanceof Date 
          ? tradeData.exitDate?.toISOString() 
          : tradeData.exitDate ? new Date(tradeData.exitDate).toISOString() : null;
      }
      
      if (tradeData.profitLoss !== undefined) updateObject.profit_loss = tradeData.profitLoss;
      if (tradeData.fees !== undefined) updateObject.fees = tradeData.fees;
      if (tradeData.notes !== undefined) updateObject.notes = tradeData.notes;
      if (tradeData.tags !== undefined) updateObject.tags = tradeData.tags;
      if (tradeData.rating !== undefined) updateObject.rating = tradeData.rating;
      if (tradeData.stopLoss !== undefined) updateObject.stop_loss = tradeData.stopLoss;
      if (tradeData.takeProfit !== undefined) updateObject.take_profit = tradeData.takeProfit;
      if (tradeData.durationMinutes !== undefined) updateObject.duration_minutes = tradeData.durationMinutes;
      if (tradeData.marketSession !== undefined) updateObject.market_session = tradeData.marketSession;
      if (tradeData.playbook !== undefined) updateObject.playbook = tradeData.playbook;
      if (tradeData.followedRules !== undefined) updateObject.followed_rules = tradeData.followedRules;
      
      const { data, error } = await supabase
        .from('trades')
        .update(updateObject)
        .eq('id', id)
        .select()
        .single();
      
      if (error || !data) {
        console.error('Error updating trade:', error);
        return null;
      }
      
      return formatTrade(data);
    } catch (err) {
      console.error('Error in updateTrade:', err);
      return null;
    }
  },

  async deleteTrade(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting trade:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in deleteTrade:', err);
      return false;
    }
  },

  async findTradesByFilter(filter: Partial<ITrade>): Promise<ITrade[]> {
    try {
      let query = supabase.from('trades').select('*');
      
      // Manually list all possible filter fields to avoid recursion
      if (filter.userId) query = query.eq('user_id', filter.userId);
      if (filter.symbol) query = query.eq('symbol', filter.symbol);
      if (filter.direction) query = query.eq('direction', filter.direction);
      if (filter.playbook) query = query.eq('playbook', filter.playbook);
      if (filter.marketSession) query = query.eq('market_session', filter.marketSession);
      
      const { data, error } = await query;
      
      if (error || !data) {
        console.error('Error filtering trades:', error);
        return [];
      }
      
      return data.map(formatTrade);
    } catch (err) {
      console.error('Error in findTradesByFilter:', err);
      return [];
    }
  }
};

function formatTrade(data: any): ITrade {
  return {
    id: data.id,
    userId: data.user_id,
    symbol: data.symbol,
    entryPrice: data.entry_price,
    exitPrice: data.exit_price,
    quantity: data.quantity,
    direction: data.direction,
    entryDate: new Date(data.entry_date),
    exitDate: data.exit_date ? new Date(data.exit_date) : null,
    profitLoss: data.profit_loss,
    fees: data.fees || 0,
    notes: data.notes || '',
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    rating: data.rating || 0,
    stopLoss: data.stop_loss,
    takeProfit: data.take_profit,
    durationMinutes: data.duration_minutes,
    playbook: data.playbook,
    followedRules: data.followed_rules || [],
    marketSession: data.market_session
  };
}
