
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { Trade as TradeType } from '@/types/trade';
import { calculateProfitLoss } from '@/utils/tradeCalculations';
import { defaultSymbols, defaultAccounts, defaultHashtags } from '@/data/defaultTradeData';
import { useTradeOperations } from '@/hooks/useTradeOperations';

// Export the Trade type to be used in other components
export type Trade = TradeType;

// Add these types that were previously missing
export interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Symbol {
  symbol: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity';
}

type TradeContextType = {
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
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbols, setSymbols] = useState<Symbol[]>(defaultSymbols);
  const [allHashtags, setAllHashtags] = useState<string[]>(defaultHashtags);
  const { toast } = useToast();
  const { user } = useAuth();
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const tradeOps = useTradeOperations(user?.id);

  useEffect(() => {
    if (user) {
      const fetchTrades = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const formattedTrades: Trade[] = data.map(trade => ({
            id: trade.id,
            userId: trade.user_id,
            account: 'Main Trading',
            date: trade.entry_date.split('T')[0],
            pair: trade.symbol,
            type: trade.direction === 'long' ? 'Buy' : 'Sell',
            entry: trade.entry_price,
            exit: trade.exit_price || 0,
            lotSize: trade.quantity,
            stopLoss: trade.stop_loss || null,
            takeProfit: trade.take_profit || null,
            riskPercentage: 0,
            returnPercentage: 0,
            profitLoss: trade.profit_loss || 0,
            commission: trade.fees || 0,
            total: (trade.profit_loss || 0) - (trade.fees || 0),
            durationMinutes: trade.duration_minutes || 0,
            notes: trade.notes || '',
            imageUrl: null,
            beforeImageUrl: null,
            afterImageUrl: null,
            hashtags: trade.tags || [],
            createdAt: trade.created_at,
            rating: trade.rating || 0
          }));

          setTrades(formattedTrades);

          const uniqueHashtags = Array.from(new Set(
            formattedTrades.flatMap(trade => trade.hashtags)
          ));
          setAllHashtags(prevHashtags => [
            ...prevHashtags,
            ...uniqueHashtags.filter(tag => !prevHashtags.includes(tag))
          ]);
        } catch (error) {
          console.error('Error fetching trades:', error);
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء جلب التداولات",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };

      fetchTrades();
    } else {
      setTrades([]);
      setLoading(false);
    }
  }, [user, toast]);

  const getTrade = (id: string) => trades.find(trade => trade.id === id);
  const getAllTrades = () => trades;
  
  const addHashtag = (hashtag: string) => {
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags([...allHashtags, hashtag]);
    }
  };
  
  const addSymbol = (symbol: Symbol) => {
    if (!symbols.some(s => s.symbol === symbol.symbol)) {
      setSymbols([...symbols, symbol]);
      toast({
        title: "Symbol Added",
        description: `${symbol.name} has been added to your symbols list`,
      });
    }
  };

  const fetchTradingAccounts = async () => {
    if (!user) return;

    try {
      const accounts = await userService.getTradingAccounts(user.id);
      setTradingAccounts(accounts);
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الحسابات",
        variant: "destructive"
      });
    }
  };

  const createTradingAccount = async (name: string, balance: number) => {
    if (!user) throw new Error('User not authenticated');

    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الحساب",
        variant: "destructive"
      });
      throw new Error('Account name is required');
    }

    try {
      const newAccount = await userService.createTradingAccount(user.id, name, balance);
      setTradingAccounts(prev => [...prev, newAccount]);
      toast({
        title: "حساب جديد",
        description: `تم إنشاء الحساب ${name}`,
      });
      return newAccount;
    } catch (error: any) {
      console.error('Error creating trading account:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTradingAccounts();
    }
  }, [user]);

  return (
    <TradeContext.Provider value={{ 
      trades,
      addTrade: tradeOps.addTrade,
      updateTrade: tradeOps.updateTrade,
      deleteTrade: tradeOps.deleteTrade,
      getTrade,
      getAllTrades,
      loading,
      accounts: defaultAccounts,
      pairs: symbols.map(s => s.symbol),
      symbols,
      addSymbol,
      allHashtags,
      addHashtag,
      calculateProfitLoss,
      tradingAccounts,
      createTradingAccount,
      fetchTradingAccounts,
    }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};
