
import { ITrade } from '@/services/tradeService';

export interface Trade extends ITrade {
  // Backward compatibility fields for UI components
  date?: string;
  pair?: string;
  entry?: number;
  exit?: number;
  type?: string;
  account?: string;
  lotSize?: number;
  total?: number;
  hashtags?: string[];
  // Add commission as an alias for fees
  commission?: number;
}

export const mapDBTradeToTrade = (dbTrade: any): Trade => {
  const trade: Trade = {
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
    updatedAt: new Date(dbTrade.updated_at || dbTrade.created_at),
    rating: dbTrade.rating || 0,
    stopLoss: dbTrade.stop_loss,
    takeProfit: dbTrade.take_profit,
    durationMinutes: dbTrade.duration_minutes,
    playbook: dbTrade.playbook,
    followedRules: dbTrade.followed_rules || [],
    marketSession: dbTrade.market_session,
    accountId: dbTrade.account_id,
    imageUrl: dbTrade.image_url,
    beforeImageUrl: dbTrade.before_image_url,
    afterImageUrl: dbTrade.after_image_url
  };

  // Add backward compatibility fields
  trade.date = dbTrade.entry_date ? dbTrade.entry_date.split('T')[0] : new Date().toISOString().split('T')[0];
  trade.pair = dbTrade.symbol;
  trade.entry = dbTrade.entry_price;
  trade.exit = dbTrade.exit_price;
  trade.type = dbTrade.direction === 'long' ? 'Buy' : 'Sell';
  trade.lotSize = dbTrade.quantity;
  trade.total = (dbTrade.profit_loss || 0) - (dbTrade.fees || 0);
  trade.hashtags = dbTrade.tags || [];
  trade.account = 'Main Trading'; // Default account name
  trade.commission = dbTrade.fees; // Alias for fees

  return trade;
};

export const mapTradeToDBTrade = (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): any => {
  const fees = trade.fees || trade.commission || 0;
  
  return {
    symbol: trade.symbol || trade.pair,
    entry_price: trade.entryPrice || trade.entry,
    exit_price: trade.exitPrice || trade.exit,
    quantity: trade.quantity || trade.lotSize,
    direction: trade.direction || (trade.type === 'Buy' ? 'long' : 'short'),
    entry_date: trade.entryDate || (trade.date ? new Date(trade.date) : new Date()),
    exit_date: trade.exitDate || null,
    profit_loss: trade.profitLoss,
    fees: fees,
    notes: trade.notes,
    tags: trade.tags || trade.hashtags || [],
    rating: trade.rating || 0,
    stop_loss: trade.stopLoss,
    take_profit: trade.takeProfit,
    duration_minutes: trade.durationMinutes,
    playbook: trade.playbook,
    followed_rules: trade.followedRules || [],
    market_session: trade.marketSession,
    account_id: trade.accountId,
    image_url: trade.imageUrl,
    before_image_url: trade.beforeImageUrl,
    after_image_url: trade.afterImageUrl
  };
};
