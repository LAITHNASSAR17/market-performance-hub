
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
  playbook: string | null;
  followedRules: string[];
  marketSession: string | null;
}

export const tradeService = {
  async getTradeById(id: string): Promise<ITrade | null> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching trade by ID:', error);
      return null;
    }
    return formatTrade(data);
  },

  async getAllTrades(): Promise<ITrade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      console.error('Error fetching all trades:', error);
      return [];
    }
    return data.map(formatTrade);
  },

  async createTrade(tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITrade> {
    console.log('Creating trade with data:', tradeData);
    
    const { data, error } = await supabase
      .from('trades')
      .insert({
        symbol: tradeData.symbol,
        user_id: tradeData.userId,
        entry_price: tradeData.entryPrice,
        exit_price: tradeData.exitPrice,
        quantity: tradeData.quantity,
        direction: tradeData.direction,
        entry_date: tradeData.entryDate.toISOString(),
        exit_date: tradeData.exitDate ? tradeData.exitDate.toISOString() : null,
        profit_loss: tradeData.profitLoss,
        fees: tradeData.fees || 0,
        notes: tradeData.notes || '',
        tags: tradeData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rating: tradeData.rating || 0,
        stop_loss: tradeData.stopLoss || null,
        take_profit: tradeData.takeProfit || null,
        duration_minutes: tradeData.durationMinutes || null,
        market_session: tradeData.marketSession || null,
        followed_rules: tradeData.followedRules || [],
        playbook: tradeData.playbook || null
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating trade:', error);
      throw new Error(`Error creating trade: ${error?.message}`);
    }
    
    console.log('Trade created successfully:', data);
    return formatTrade(data);
  },

  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
    const updateObject: any = {
      updated_at: new Date().toISOString()
    };
    
    if (tradeData.profitLoss !== undefined) updateObject.profit_loss = tradeData.profitLoss;
    if (tradeData.fees !== undefined) updateObject.fees = tradeData.fees;
    
    if (tradeData.symbol !== undefined) updateObject.symbol = tradeData.symbol;
    if (tradeData.entryPrice !== undefined) updateObject.entry_price = tradeData.entryPrice;
    if (tradeData.exitPrice !== undefined) updateObject.exit_price = tradeData.exitPrice;
    if (tradeData.quantity !== undefined) updateObject.quantity = tradeData.quantity;
    if (tradeData.direction !== undefined) updateObject.direction = tradeData.direction;
    if (tradeData.entryDate !== undefined) updateObject.entry_date = tradeData.entryDate.toISOString();
    if (tradeData.exitDate !== undefined) updateObject.exit_date = tradeData.exitDate ? tradeData.exitDate.toISOString() : null;
    if (tradeData.profitLoss !== undefined) updateObject.profit_loss = tradeData.profitLoss;
    if (tradeData.fees !== undefined) updateObject.fees = tradeData.fees;
    if (tradeData.notes !== undefined) updateObject.notes = tradeData.notes;
    if (tradeData.tags !== undefined) updateObject.tags = tradeData.tags;
    if (tradeData.rating !== undefined) updateObject.rating = tradeData.rating;
    if (tradeData.stopLoss !== undefined) updateObject.stop_loss = tradeData.stopLoss;
    if (tradeData.takeProfit !== undefined) updateObject.take_profit = tradeData.takeProfit;
    if (tradeData.durationMinutes !== undefined) updateObject.duration_minutes = tradeData.durationMinutes;
    if (tradeData.marketSession !== undefined) updateObject.market_session = tradeData.marketSession;
    if (tradeData.followedRules !== undefined) updateObject.followed_rules = tradeData.followedRules;
    if (tradeData.playbook !== undefined) updateObject.playbook = tradeData.playbook;
    
    console.log('Updating trade with data:', updateObject);

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
  },

  async deleteTrade(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting trade:', error);
      return false;
    }
    return true;
  },

  async findTradesByFilter(filter: Partial<ITrade>): Promise<ITrade[]> {
    let query = supabase.from('trades').select('*');
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        query = query.eq(dbKey, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error || !data) {
      console.error('Error finding trades by filter:', error);
      return [];
    }
    return data.map(formatTrade);
  }
};

function formatTrade(data: any): ITrade {
  try {
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
      playbook: data.playbook || null,
      followedRules: data.followed_rules || [],
      marketSession: data.market_session || null
    };
  } catch (error) {
    console.error('Error formatting trade:', error, data);
    throw error;
  }
}
