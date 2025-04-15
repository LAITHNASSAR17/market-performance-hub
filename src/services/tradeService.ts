
import { supabase } from '@/lib/supabase';

export interface ITrade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  direction: 'long' | 'short';
  entryDate: Date;
  exitDate: Date;
  profitLoss: number;
  fees: number;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
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

  async getAllTrades(userId?: string): Promise<ITrade[]> {
    // Get the current authenticated user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    // If no user, return empty array
    if (!userId) return [];

    // Get trades for this specific user only
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data) return [];
    return data.map(formatTrade);
  },

  async createTrade(tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITrade> {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('trades')
      .insert({
        ...tradeData,
        user_id: user.id, // Ensure the trade is associated with the current user
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating trade: ${error?.message}`);
    return formatTrade(data);
  },

  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('trades')
      .update({
        ...tradeData,
        updated_at: now
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure the user can only update their own trades
      .select()
      .single();
    
    if (error || !data) return null;
    return formatTrade(data);
  },

  async deleteTrade(id: string): Promise<boolean> {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure the user can only delete their own trades
    
    return !error;
  },

  async findTradesByFilter(filter: Partial<ITrade>): Promise<ITrade[]> {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase.from('trades').select('*').eq('user_id', user.id);
    
    // Apply additional filters dynamically
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && key !== 'userId') {
        query = query.eq(key, value);
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
    updatedAt: new Date(data.updated_at)
  };
}
