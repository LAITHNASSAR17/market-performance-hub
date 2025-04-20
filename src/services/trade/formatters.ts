
import { ITrade } from './types';

export function formatTrade(data: any): ITrade {
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

export function formatTradeForDB(tradeData: Partial<ITrade>) {
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString()
  };
  
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

  return updateData;
}
