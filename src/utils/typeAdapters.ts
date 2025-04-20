
import { ITrade } from '@/services/tradeService';

// Function to adapt database trade object to ITrade interface
export const adaptTradeToITrade = (dbTrade: any): ITrade => {
  return {
    id: dbTrade.id,
    userId: dbTrade.user_id,
    symbol: dbTrade.symbol,
    entryPrice: dbTrade.entry_price,
    exitPrice: dbTrade.exit_price,
    quantity: dbTrade.quantity,
    direction: dbTrade.direction,
    entryDate: new Date(dbTrade.entry_date),
    exitDate: dbTrade.exit_date ? new Date(dbTrade.exit_date) : null,
    profitLoss: dbTrade.profit_loss,
    fees: dbTrade.fees || 0,
    notes: dbTrade.notes || '',
    tags: dbTrade.tags || [],
    createdAt: new Date(dbTrade.created_at),
    updatedAt: new Date(dbTrade.updated_at),
    rating: dbTrade.rating || 0,
    stopLoss: dbTrade.stop_loss,
    takeProfit: dbTrade.take_profit,
    durationMinutes: dbTrade.duration_minutes,
    playbook: dbTrade.playbook,
    followedRules: dbTrade.followed_rules || [],
    marketSession: dbTrade.market_session
  };
};

// Function to adapt ITrade interface to database trade object format
export const adaptITradeToDBTrade = (trade: ITrade): Record<string, any> => {
  return {
    id: trade.id,
    user_id: trade.userId,
    symbol: trade.symbol,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,
    quantity: trade.quantity,
    direction: trade.direction,
    entry_date: trade.entryDate instanceof Date ? trade.entryDate.toISOString() : trade.entryDate,
    exit_date: trade.exitDate instanceof Date ? trade.exitDate.toISOString() : trade.exitDate,
    profit_loss: trade.profitLoss,
    fees: trade.fees,
    notes: trade.notes,
    tags: trade.tags,
    created_at: trade.createdAt instanceof Date ? trade.createdAt.toISOString() : trade.createdAt,
    updated_at: trade.updatedAt instanceof Date ? trade.updatedAt.toISOString() : trade.updatedAt,
    rating: trade.rating,
    stop_loss: trade.stopLoss,
    take_profit: trade.takeProfit,
    duration_minutes: trade.durationMinutes,
    playbook: trade.playbook,
    followed_rules: trade.followedRules,
    market_session: trade.marketSession
  };
};
