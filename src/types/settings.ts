
export interface SiteSettings {
  id: string;
  site_name: string;
  theme?: string;
  language?: string;
  company_email: string;
  support_phone?: string;
  copyright_text?: string;
  created_at: string;
  updated_at: string;
}

export interface HomepageContent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  subscription_tier?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content?: string;
  tradeId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  symbol: string; 
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
  total: number;
  playbook?: string;
  followedRules?: string[];
  marketSession?: string;
}

// Add required interfaces for Playbook components
export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category?: 'trend' | 'reversal' | 'breakout' | 'other';
  isPrivate?: boolean;
  rating: number;
  winRate?: number;
  rMultiple?: number;
  expectedValue?: number;
  profitFactor?: number;
  netProfitLoss?: number;
  totalTrades?: number;
  missedTrades?: number;
  avgWinner?: number;
  avgLoser?: number;
  rules?: PlaybookRule[];
  created_at?: string;
  updated_at?: string;
}

export interface PlaybookRule {
  id: string;
  type: 'entry' | 'exit' | 'risk' | 'custom';
  description: string;
}
