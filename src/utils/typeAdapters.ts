
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
    entryDate: dbTrade.entry_date,
    exitDate: dbTrade.exit_date,
    profitLoss: dbTrade.profit_loss,
    fees: dbTrade.fees,
    notes: dbTrade.notes,
    tags: dbTrade.tags || [],
    // Add any other required fields with appropriate defaults
    pair: dbTrade.symbol,
    type: dbTrade.direction === 'long' ? 'buy' : 'sell',
    size: dbTrade.quantity,
    pnl: dbTrade.profit_loss
  };
};
