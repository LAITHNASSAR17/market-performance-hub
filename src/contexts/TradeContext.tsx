
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as tradeService from '@/services/trade';
import { useToast } from '@/hooks/use-toast';
import { mapDBTradeToTrade, mapTradeToDBTrade, Trade } from '@/types/trade';

interface TradeContextType {
  trades: Trade[];
  allHashtags: string[];
  isLoading: boolean;
  error: string | null;
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  addHashtag: (hashtag: string) => void;
  removeHashtag: (hashtag: string) => void;
  getTrade: (id: string) => Trade | undefined;
  pairs: string[];
  getAllTrades: () => Promise<Trade[]>;
  addSymbol: (symbol: string) => void;
  tradingAccounts: string[];
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [pairs, setPairs] = useState<string[]>(['EURUSD', 'GBPUSD', 'USDJPY']);
  const tradingAccounts = ['Demo', 'Main Trading', 'Practice']; 

  // Fetch trades on component mount
  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const fetchedDBTrades = await tradeService.getAllTrades();
      const mappedTrades = fetchedDBTrades.map(mapDBTradeToTrade);
      setTrades(mappedTrades);
      
      // Extract unique hashtags from trades
      const hashtags = Array.from(new Set(
        mappedTrades.flatMap(trade => trade.hashtags)
      )) as string[];
      setAllHashtags(hashtags);
      
      // Extract unique trading pairs
      const uniquePairs = Array.from(new Set(
        mappedTrades.map(trade => trade.pair)
      )) as string[];
      setPairs(uniquePairs.length > 0 ? uniquePairs : ['EURUSD', 'GBPUSD', 'USDJPY']);
      
    } catch (error) {
      console.error('Error fetching trades:', error);
      setError('Failed to fetch trades');
      toast({
        title: "خطأ",
        description: "فشل في جلب الصفقات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrade = (id: string): Trade | undefined => {
    return trades.find(trade => trade.id === id);
  };

  const getAllTrades = async (): Promise<Trade[]> => {
    const dbTrades = await tradeService.getAllTrades();
    return dbTrades.map(mapDBTradeToTrade);
  };

  const addSymbol = (symbol: string) => {
    if (!pairs.includes(symbol)) {
      setPairs(prevPairs => [...prevPairs, symbol]);
    }
  };

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    try {
      console.log("Trade data received in context:", tradeData);
      if (!tradeData.symbol && tradeData.pair) {
        tradeData.symbol = tradeData.pair;
      }
      
      const dbTradeData = mapTradeToDBTrade(tradeData);
      console.log("Mapped to DB trade data:", dbTradeData);
      
      await tradeService.createTrade(dbTradeData);
      await fetchTrades(); // Refresh trades from database
      toast({
        title: "نجاح",
        description: "تمت إضافة الصفقة بنجاح",
      });
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الصفقة",
        variant: "destructive"
      });
    }
  };

  const updateTrade = async (id: string, tradeData: Partial<Trade>) => {
    try {
      const dbTradeData = { ...mapTradeToDBTrade(tradeData as Omit<Trade, 'id' | 'createdAt'>) };
      await tradeService.updateTrade(id, dbTradeData);
      await fetchTrades(); // Refresh trades from database
      toast({
        title: "نجاح",
        description: "تم تحديث الصفقة بنجاح",
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الصفقة",
        variant: "destructive"
      });
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      await tradeService.deleteTrade(id);
      await fetchTrades(); // Refresh trades from database
      toast({
        title: "نجاح",
        description: "تم حذف الصفقة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الصفقة",
        variant: "destructive"
      });
    }
  };

  const addHashtag = (hashtag: string) => {
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags(prev => [...prev, hashtag]);
    }
  };

  const removeHashtag = (hashtag: string) => {
    setAllHashtags(prev => prev.filter(h => h !== hashtag));
  };

  return (
    <TradeContext.Provider
      value={{
        trades,
        allHashtags,
        isLoading,
        error,
        addTrade,
        updateTrade,
        deleteTrade,
        addHashtag,
        removeHashtag,
        getTrade,
        pairs,
        getAllTrades,
        addSymbol,
        tradingAccounts
      }}
    >
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

export type { Trade };
