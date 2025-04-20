
import { supabase } from '@/lib/supabase';
import { ITrade } from './types';
import { formatTrade, formatTradeForDB } from './formatters';

export async function createTrade(tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITrade> {
  console.log('Creating trade in database:', tradeData);
  
  const dbData = {
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
  
  if (error || !data) {
    console.error('Error creating trade:', error);
    throw new Error(`Error creating trade: ${error?.message || 'Unknown error'}`);
  }
  
  console.log('Trade created successfully:', data);
  return formatTrade(data);
}

export async function updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
  const updateData = formatTradeForDB(tradeData);
  console.log('Updating trade in database:', id, updateData);
  
  const { data, error } = await supabase
    .from('trades')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating trade:', error);
    return null;
  }
  
  if (!data) return null;
  
  console.log('Trade updated successfully:', data);
  return formatTrade(data);
}

export async function deleteTrade(id: string): Promise<boolean> {
  console.log('Deleting trade from database:', id);
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting trade:', error);
    return false;
  }
  
  console.log('Trade deleted successfully');
  return true;
}
