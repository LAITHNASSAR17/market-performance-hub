
import { ITrade } from '@/services/tradeService';

export interface Trade extends ITrade {}

export const mapDBTradeToTrade = (dbTrade: any): Trade => ({
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
});

export const mapTradeToDBTrade = (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): any => ({
  symbol: trade.symbol,
  entry_price: trade.entryPrice,
  exit_price: trade.exitPrice,
  quantity: trade.quantity,
  direction: trade.direction,
  entry_date: trade.entryDate,
  exit_date: trade.exitDate,
  profit_loss: trade.profitLoss,
  fees: trade.fees,
  notes: trade.notes,
  tags: trade.tags || [],
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
});
