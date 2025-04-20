
import { supabase } from '@/lib/supabase';
import { ITrade, TradeFilter } from './types';
import { formatTrade } from './formatters';

export async function getTradeById(id: string): Promise<ITrade | null> {
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
}

export async function getAllTrades(): Promise<ITrade[]> {
  console.log('Fetching all trades from supabase');
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all trades:', error);
    return [];
  }
  
  if (!data) return [];
  console.log(`Fetched ${data.length} trades from database`);
  return data.map(formatTrade);
}

export async function findTradesByFilter(filter: TradeFilter): Promise<ITrade[]> {
  let query = supabase.from('trades').select('*');
  
  if (filter.userId) query = query.eq('user_id', filter.userId);
  if (filter.symbol) query = query.eq('symbol', filter.symbol);
  if (filter.direction) query = query.eq('direction', filter.direction);
  if (filter.marketSession) query = query.eq('market_session', filter.marketSession);
  if (filter.playbook) query = query.eq('playbook', filter.playbook);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error finding trades by filter:', error);
    return [];
  }
  
  if (!data) return [];
  return data.map(formatTrade);
}
