
import { ITrade } from '@/services/tradeService';

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  type: 'Buy' | 'Sell';
  entry: number;
  exit: number;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  riskPercentage: number;
  returnPercentage: number;
  profitLoss: number;
  durationMinutes: number;
  notes: string;
  date: string;
  account: string;
  imageUrl: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  hashtags: string[];
  createdAt: string;
  commission: number;
  rating: number; // Added rating field
}

// Update mapDBTradeToTrade to include rating
export const mapDBTradeToTrade = (dbTrade: ITrade): Trade => ({
  id: dbTrade.id,
  userId: dbTrade.userId,
  pair: dbTrade.symbol,
  type: dbTrade.direction === 'long' ? 'Buy' : 'Sell',
  entry: dbTrade.entryPrice,
  exit: dbTrade.exitPrice || 0,
  lotSize: dbTrade.quantity,
  stopLoss: null,
  takeProfit: null,
  riskPercentage: 0,
  returnPercentage: 0,
  profitLoss: dbTrade.profitLoss || 0,
  durationMinutes: 0,
  notes: dbTrade.notes || '',
  date: dbTrade.entryDate.toISOString().split('T')[0],
  account: 'Main Trading',
  imageUrl: null,
  beforeImageUrl: null,
  afterImageUrl: null,
  hashtags: dbTrade.tags || [],
  createdAt: dbTrade.createdAt.toISOString(),
  commission: dbTrade.fees || 0,
  rating: dbTrade.rating || 0 // Get rating from DB or default to 0
});

// Update mapTradeToDBTrade to include rating
export const mapTradeToDBTrade = (trade: Omit<Trade, 'id' | 'userId'>): Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'> => ({
  userId: '', // Will be set by the service
  symbol: trade.pair,
  entryPrice: trade.entry,
  exitPrice: trade.exit,
  quantity: trade.lotSize,
  direction: trade.type === 'Buy' ? 'long' : 'short',
  entryDate: new Date(trade.date),
  exitDate: trade.exit ? new Date(trade.date) : null,
  profitLoss: trade.profitLoss,
  fees: trade.commission || 0,
  notes: trade.notes,
  tags: trade.hashtags,
  rating: trade.rating || 0 // Include the rating field here
});
