
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
    fees: dbTrade.fees,
    notes: dbTrade.notes,
    tags: dbTrade.tags || [],
    createdAt: new Date(dbTrade.created_at),
    updatedAt: new Date(dbTrade.updated_at),
    rating: dbTrade.rating || 0,
    stopLoss: dbTrade.stop_loss,
    takeProfit: dbTrade.take_profit,
    durationMinutes: dbTrade.duration_minutes,
    playbook: dbTrade.playbook,
    followedRules: dbTrade.followedRules,
    marketSession: dbTrade.market_session
  };
};
