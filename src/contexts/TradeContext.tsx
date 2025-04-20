import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { Trade } from '@/types/trade';
import { sampleAccounts, calculateProfitLoss } from '@/utils/tradeConstants';
import { useTradeManagement } from '@/hooks/useTradeManagement';
import { useSymbolManagement } from '@/hooks/useSymbolManagement';
import { useTradingAccounts } from '@/hooks/useTradingAccounts';
import { supabase } from '@/lib/supabase';

export type { Trade } from '@/types/trade';

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

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => Promise<Trade | void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<Trade | void>;
  deleteTrade: (id: string) => Promise<void>;
  getTrade: (id: string) => Trade | undefined;
  getAllTrades: () => Trade[];
  loading: boolean;
  error: string | null;
  refreshTrades: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allHashtags, setAllHashtags] = useState<string[]>([
    'setup', 'momentum', 'breakout', 'retracement', 'technical', 'fundamental', 
    'news', 'mistake', 'perfecttrade', 'patience', 'fakeout'
  ]);
  
  const { user } = useAuth();
  const { trades, setTrades, addTrade, updateTrade, deleteTrade } = useTradeManagement([]);
  const { symbols, addSymbol, getSymbolPairs } = useSymbolManagement();
  const { tradingAccounts, createTradingAccount, fetchTradingAccounts } = useTradingAccounts();

  const getTrade = (id: string) => {
    return trades.find(trade => trade.id === id);
  };

  const getAllTrades = (): Trade[] => {
    return trades;
  };

  const addHashtag = (hashtag: string) => {
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags([...allHashtags, hashtag]);
    }
  };

  const { toast } = useToast();

  const fetchTrades = async () => {
    if (!user) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

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
        account: trade.account_id ? 'Trading Account' : 'Main Trading',
        date: new Date(trade.entry_date).toISOString().split('T')[0],
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
        imageUrl: trade.image_url || null,
        beforeImageUrl: trade.before_image_url || null,
        afterImageUrl: trade.after_image_url || null,
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
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError("حدث خطأ أثناء جلب التداولات");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب التداولات. ستظهر بيانات تداول عينة بدلاً من ذلك.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshTrades = async () => {
    await fetchTrades();
  };

  useEffect(() => {
    fetchTrades();
  }, [user, toast]);

  return (
    <TradeContext.Provider value={{
      trades,
      addTrade,
      updateTrade,
      deleteTrade,
      getTrade,
      getAllTrades,
      loading,
      error,
      refreshTrades,
      accounts: sampleAccounts,
      pairs: getSymbolPairs(),
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
