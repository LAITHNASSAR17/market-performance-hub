
export interface SiteSettings {
  id: string;
  site_name: string;
  theme?: string;
  language?: string;
  company_email?: string;  // Added to match existing uses
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  symbol: string;
  type: 'Buy' | 'Sell';  // Explicitly defined to match type constraints
  entry: number;
  exit: number | null;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  riskPercentage: number;
  returnPercentage: number;
  profitLoss: number | null;
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
  total: number;
  playbook?: string;
  followedRules?: string[];
  marketSession?: string;
}
