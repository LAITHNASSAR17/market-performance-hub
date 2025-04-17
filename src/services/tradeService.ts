
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
  isMultipleTrades?: boolean;
  tradesCount?: number;
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
    const now = new Date().toISOString();
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
        created_at: now,
        updated_at: now,
        rating: tradeData.rating || 0,
        stop_loss: tradeData.stopLoss,
        take_profit: tradeData.takeProfit,
        duration_minutes: tradeData.durationMinutes,
        is_multiple_trades: tradeData.isMultipleTrades || false,
        trades_count: tradeData.tradesCount || 1
      })
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating trade: ${error?.message}`);
    return formatTrade(data);
  },

  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
    const now = new Date().toISOString();
    const updateObject: any = {
      updated_at: now
    };
    
    // Map the trade data to the database columns
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
    if (tradeData.isMultipleTrades !== undefined) updateObject.is_multiple_trades = tradeData.isMultipleTrades;
    if (tradeData.tradesCount !== undefined) updateObject.trades_count = tradeData.tradesCount;
    
    const { data, error } = await supabase
      .from('trades')
      .update(updateObject)
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

  async findTradesByFilter(filter: Partial<ITrade>): Promise<ITrade[]> {
    let query = supabase.from('trades').select('*');
    
    // Apply filters dynamically
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        // Map from camelCase to snake_case for database column names
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        query = query.eq(dbKey, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error || !data) return [];
    return data.map(formatTrade);
  }
};

// Helper function to format Supabase data to our interface format
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
    isMultipleTrades: data.is_multiple_trades || false,
    tradesCount: data.trades_count || 1
  };
}
