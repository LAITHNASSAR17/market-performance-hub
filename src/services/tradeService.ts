
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
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return formatTrade(data);
  },

  async getAllTrades(): Promise<ITrade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*');
    
    if (error || !data) return [];
    return data.map(formatTrade);
  },

  async createTrade(tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITrade> {
    // Convert our interface field names to database column names
    const dbData = {
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
      rating: tradeData.rating || 0,
      stop_loss: tradeData.stopLoss,
      take_profit: tradeData.takeProfit,
      duration_minutes: tradeData.durationMinutes,
      market_session: tradeData.marketSession,
      playbook: tradeData.playbook,
      followed_rules: tradeData.followedRules
    };

    const { data, error } = await supabase
      .from('trades')
      .insert(dbData)
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating trade: ${error?.message}`);
    return formatTrade(data);
  },

  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
    // Convert our interface field names to database column names
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (tradeData.userId !== undefined) updateData.user_id = tradeData.userId;
    if (tradeData.symbol !== undefined) updateData.symbol = tradeData.symbol;
    if (tradeData.entryPrice !== undefined) updateData.entry_price = tradeData.entryPrice;
    if (tradeData.exitPrice !== undefined) updateData.exit_price = tradeData.exitPrice;
    if (tradeData.quantity !== undefined) updateData.quantity = tradeData.quantity;
    if (tradeData.direction !== undefined) updateData.direction = tradeData.direction;
    if (tradeData.entryDate !== undefined) updateData.entry_date = tradeData.entryDate.toISOString();
    if (tradeData.exitDate !== undefined) updateData.exit_date = tradeData.exitDate ? tradeData.exitDate.toISOString() : null;
    if (tradeData.profitLoss !== undefined) updateData.profit_loss = tradeData.profitLoss;
    if (tradeData.fees !== undefined) updateData.fees = tradeData.fees;
    if (tradeData.notes !== undefined) updateData.notes = tradeData.notes;
    if (tradeData.tags !== undefined) updateData.tags = tradeData.tags;
    if (tradeData.rating !== undefined) updateData.rating = tradeData.rating;
    if (tradeData.stopLoss !== undefined) updateData.stop_loss = tradeData.stopLoss;
    if (tradeData.takeProfit !== undefined) updateData.take_profit = tradeData.takeProfit;
    if (tradeData.durationMinutes !== undefined) updateData.duration_minutes = tradeData.durationMinutes;
    if (tradeData.marketSession !== undefined) updateData.market_session = tradeData.marketSession;
    if (tradeData.playbook !== undefined) updateData.playbook = tradeData.playbook;
    if (tradeData.followedRules !== undefined) updateData.followed_rules = tradeData.followedRules;
    
    const { data, error } = await supabase
      .from('trades')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatTrade(data);
  },

  async deleteTrade(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // Simplified findTradesByFilter method to avoid deep type instantiation
  async findTradesByFilter(filter: Partial<Record<string, any>>): Promise<ITrade[]> {
    let query = supabase.from('trades').select('*');
    
    // Convert camelCase fields to snake_case for database queries
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.symbol) query = query.eq('symbol', filter.symbol);
    if (filter.direction) query = query.eq('direction', filter.direction);
    if (filter.marketSession) query = query.eq('market_session', filter.marketSession);
    if (filter.playbook) query = query.eq('playbook', filter.playbook);
    
    const { data, error } = await query;
    
    if (error || !data) return [];
    return data.map(formatTrade);
  }
};

// Helper function to convert DB field names to our interface
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
    followedRules: data.followed_rules,
    marketSession: data.market_session
  };
}
