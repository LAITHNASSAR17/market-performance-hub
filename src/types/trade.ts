
export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  direction: string;
  entryDate: Date;
  exitDate: Date | null;
  profitLoss: number;
  fees: number;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  stopLoss: number;
  takeProfit: number;
  durationMinutes: number;
  playbook?: string;
  followedRules?: string[];
  marketSession?: string;
  accountId?: string;
  imageUrl?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  
  // Compatibility fields
  date?: string;
  pair?: string;
  type?: 'Buy' | 'Sell';
  entry?: number;
  exit?: number;
  account?: string;
  lotSize?: number;
  total?: number;
  hashtags?: string[];
  commission?: number;
  
  // Added missing properties referenced in TradeTracking.tsx
  riskPercentage: number;
  returnPercentage: number;
}
