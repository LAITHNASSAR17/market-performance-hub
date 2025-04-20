import { ITrade } from '@/services/tradeService';

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  symbol?: string; // Symbol as optional property
  type: 'Buy' | 'Sell';
  entry: number;
  exit: number | null;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  riskPercentage: number;
  returnPercentage: number;
  profitLoss: number;
  durationMinutes: number | null;
  notes: string;
  date: string;
  account: string;
  imageUrl: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  hashtags: string[];
  createdAt: string;
  commission: number;
  rating: number;
  total: number;  // Net profit/loss after fees
  playbook?: string; // Field to link to a playbook
  followedRules?: string[]; // Rules that were followed in this trade
  marketSession?: string; // Market session when the trade was executed
}

export const mapDBTradeToTrade = (dbTrade: ITrade): Trade => ({
  id: dbTrade.id,
  userId: dbTrade.userId,
  pair: dbTrade.symbol,
  symbol: dbTrade.symbol,
  type: dbTrade.direction === 'long' ? 'Buy' : 'Sell',
  entry: dbTrade.entryPrice,
  exit: dbTrade.exitPrice || null,
  lotSize: dbTrade.quantity,
  stopLoss: dbTrade.stopLoss || null,
  takeProfit: dbTrade.takeProfit || null,
  riskPercentage: 0,
  returnPercentage: 0,
  profitLoss: dbTrade.profitLoss || 0,
  durationMinutes: dbTrade.durationMinutes || null,
  notes: dbTrade.notes || '',
  date: dbTrade.entryDate.toISOString().split('T')[0],
  account: 'Main Trading',
  imageUrl: null,
  beforeImageUrl: null,
  afterImageUrl: null,
  hashtags: dbTrade.tags || [],
  createdAt: dbTrade.createdAt.toISOString(),
  commission: dbTrade.fees || 0,
  rating: dbTrade.rating || 0,
  total: (dbTrade.profitLoss || 0) - (dbTrade.fees || 0),
  playbook: dbTrade.playbook,
  followedRules: dbTrade.followedRules,
  marketSession: dbTrade.marketSession
});

export const mapTradeToDBTrade = (trade: Omit<Trade, 'id' | 'createdAt' | 'userId'>, userId: string): Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'> => ({
  userId: userId,
  symbol: trade.symbol || trade.pair,
  entryPrice: trade.entry,
  exitPrice: trade.exit,
  quantity: trade.lotSize,
  direction: trade.type === 'Buy' ? 'long' : 'short',
  entryDate: new Date(trade.date),
  exitDate: trade.exit ? new Date(trade.date) : null,
  profitLoss: trade.profitLoss,
  fees: trade.commission || 0,
  notes: trade.notes || '',
  tags: trade.hashtags || [],
  rating: trade.rating || 0,
  stopLoss: trade.stopLoss || null,
  takeProfit: trade.takeProfit || null,
  durationMinutes: trade.durationMinutes || null,
  playbook: trade.playbook,
  followedRules: trade.followedRules,
  marketSession: trade.marketSession
});
