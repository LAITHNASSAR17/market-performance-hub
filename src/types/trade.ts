
import { ITrade } from '@/services/tradeService';

export interface Trade {
  id: string;
  userId: string;
  pair: string;
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
  symbol: string; // Make sure this is required to match with database
}

// Map database trade (ITrade) to frontend trade (Trade)
export const mapDBTradeToTrade = (dbTrade: ITrade): Trade => ({
  id: dbTrade.id,
  userId: dbTrade.userId,
  pair: dbTrade.symbol, // Map DB symbol to frontend pair
  symbol: dbTrade.symbol, // Keep the original symbol too
  type: dbTrade.direction === 'long' ? 'Buy' : 'Sell',
  entry: dbTrade.entryPrice,
  exit: dbTrade.exitPrice || 0,
  lotSize: dbTrade.quantity,
  stopLoss: dbTrade.stopLoss || null,
  takeProfit: dbTrade.takeProfit || null,
  riskPercentage: 0, // Calculate or retrieve from DB
  returnPercentage: 0, // Calculate or retrieve from DB
  profitLoss: dbTrade.profitLoss || 0,
  durationMinutes: dbTrade.durationMinutes || null,
  notes: dbTrade.notes || '',
  // Important: Always format dates consistently as YYYY-MM-DD
  date: dbTrade.entryDate.toISOString().split('T')[0],
  account: 'Main Trading', // Default account, will be customizable later
  imageUrl: null,
  beforeImageUrl: null,
  afterImageUrl: null,
  hashtags: dbTrade.tags || [],
  createdAt: dbTrade.createdAt.toISOString(),
  commission: dbTrade.fees || 0,
  rating: dbTrade.rating || 0,
  // Calculate total as profit/loss minus fees
  total: (dbTrade.profitLoss || 0) - (dbTrade.fees || 0),
  playbook: dbTrade.playbook,
  followedRules: dbTrade.followedRules,
  marketSession: dbTrade.marketSession
});

// Map frontend trade (Trade) to database trade (ITrade)
export const mapTradeToDBTrade = (trade: Omit<Trade, 'id' | 'createdAt'>): Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'> => {
  console.log('Mapping frontend trade to DB trade:', trade);
  return {
    userId: '', // Will be set by the service
    symbol: trade.symbol, // Use symbol directly since it's required now
    entryPrice: trade.entry,
    exitPrice: trade.exit,
    quantity: trade.lotSize,
    direction: trade.type === 'Buy' ? 'long' : 'short',
    entryDate: new Date(trade.date),
    exitDate: trade.exit ? new Date(trade.date) : null,
    // Here we use the raw profit/loss WITHOUT subtracting commission
    profitLoss: trade.profitLoss,
    // Commission is stored separately as fees
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
  };
};
