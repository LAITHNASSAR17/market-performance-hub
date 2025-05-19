
import { ITrade } from '@/services/tradeService';
import { Trade } from './trade';

// Define types related to trading
export type TradingAccount = {
  id: string;
  userId: string;
  name: string;
  balance: number;
  createdAt: string;
};

export type Symbol = {
  symbol: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other';
};

// Common types for all trading contexts
export interface TradingContextCommon {
  loading: boolean;
  error: string | null;
}
