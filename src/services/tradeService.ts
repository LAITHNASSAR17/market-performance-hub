
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
  notes: string | null;
  tags: string[];
  status?: 'open' | 'closed';
  account?: string;
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

  async getAllTrades(): Promise<ITrade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('entry_date', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatTrade);
  },

  async getTradesByUserId(userId: string): Promise<ITrade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatTrade);
  },

  async getOpenTrades(userId: string): Promise<ITrade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .is('exit_date', null)
      .order('entry_date', { ascending: false });
    
    if (error || !data) return [];
    return data.map(formatTrade);
  },

  async createTrade(tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITrade> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('trades')
      .insert([{
        user_id: tradeData.userId,
        symbol: tradeData.symbol,
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
        updated_at: now
      }])
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating trade: ${error?.message}`);
    return formatTrade(data);
  },

  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
    const updateData: any = {};
    
    if (tradeData.symbol) updateData.symbol = tradeData.symbol;
    if (tradeData.entryPrice !== undefined) updateData.entry_price = tradeData.entryPrice;
    if (tradeData.exitPrice !== undefined) updateData.exit_price = tradeData.exitPrice;
    if (tradeData.quantity !== undefined) updateData.quantity = tradeData.quantity;
    if (tradeData.direction) updateData.direction = tradeData.direction;
    if (tradeData.entryDate) updateData.entry_date = tradeData.entryDate.toISOString();
    if (tradeData.exitDate) updateData.exit_date = tradeData.exitDate.toISOString();
    if (tradeData.profitLoss !== undefined) updateData.profit_loss = tradeData.profitLoss;
    if (tradeData.fees !== undefined) updateData.fees = tradeData.fees;
    if (tradeData.notes !== undefined) updateData.notes = tradeData.notes;
    if (tradeData.tags) updateData.tags = tradeData.tags;
    
    updateData.updated_at = new Date().toISOString();
    
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

  async getTradeStats(userId: string): Promise<{
    totalPL: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    avgWinning: number;
    avgLosing: number;
  }> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .not('profit_loss', 'is', null);
    
    if (error || !data || data.length === 0) {
      return {
        totalPL: 0,
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        avgWinning: 0,
        avgLosing: 0
      };
    }
    
    const trades = data.map(formatTrade);
    const winningTrades = trades.filter(t => t.profitLoss && t.profitLoss > 0);
    const losingTrades = trades.filter(t => t.profitLoss && t.profitLoss < 0);
    
    const totalPL = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const totalWinning = winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const totalLosing = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0));
    
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
    const profitFactor = totalLosing > 0 ? totalWinning / totalLosing : totalWinning > 0 ? Infinity : 0;
    
    const avgWinning = winningTrades.length > 0 ? totalWinning / winningTrades.length : 0;
    const avgLosing = losingTrades.length > 0 ? Math.abs(totalLosing / losingTrades.length) : 0;
    
    return {
      totalPL,
      winRate,
      profitFactor,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWinning,
      avgLosing
    };
  },

  async getCalendarData(userId: string, year: number, month: number): Promise<any[]> {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();
    
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate);
    
    if (error || !data) return [];
    
    const trades = data.map(formatTrade);
    
    // Group trades by day
    const daysMap = new Map();
    trades.forEach(trade => {
      const day = new Date(trade.entryDate).getDate();
      if (!daysMap.has(day)) {
        daysMap.set(day, {
          day,
          date: new Date(trade.entryDate).toISOString().split('T')[0],
          trades: 0,
          profit: 0
        });
      }
      
      const dayData = daysMap.get(day);
      dayData.trades += 1;
      dayData.profit += trade.profitLoss || 0;
    });
    
    return Array.from(daysMap.values());
  },

  async getDailyPLData(userId: string, days: number = 7): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString())
      .lte('entry_date', endDate.toISOString())
      .not('profit_loss', 'is', null);
    
    if (error || !data) return [];
    
    const trades = data.map(formatTrade);
    
    // Create an array of the last 'days' days
    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const dayTrades = trades.filter(t => {
        const tradeDay = new Date(t.entryDate).toISOString().split('T')[0];
        return tradeDay === dayStr;
      });
      
      const dayProfit = dayTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
      
      dailyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dayStr,
        profit: dayProfit,
        trades: dayTrades.length
      });
    }
    
    // Reverse to get chronological order
    return dailyData.reverse();
  }
};

// Helper function to format Supabase data to match our interface
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
    status: data.exit_date ? 'closed' : 'open',
    account: data.account || 'Default',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
