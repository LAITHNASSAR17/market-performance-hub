
import { Trade } from './trade';
import { ITradingAccount } from '@/services/userService';

export interface TradingAccount extends ITradingAccount {
  currency?: string;
}

export interface Symbol {
  symbol: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity';
}

export interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  getTrade: (id: string) => Trade | undefined;
  getAllTrades: () => Trade[];
  loading: boolean;
  accounts: string[];
  pairs: string[];
  symbols: Symbol[];
  addSymbol: (symbol: Symbol) => void;
  allHashtags: string[];
  addHashtag: (hashtag: string) => void;
  calculateProfitLoss: (entry: number, exit: number, lotSize: number, type: 'Buy' | 'Sell', instrumentType: string) => number;
  tradingAccounts: TradingAccount[];
  createTradingAccount: (name: string, balance: number) => Promise<TradingAccount>;
  fetchTradingAccounts: () => Promise<void>;
}
