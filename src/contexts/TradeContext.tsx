
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { tradeService } from '@/services/tradeService';
import type { ITrade } from '@/services/tradeService';
import { useToast } from '@/hooks/use-toast';

interface TradeContextType {
  trades: ITrade[];
  allHashtags: string[];
  isLoading: boolean;
  error: string | null;
  addTrade: (trade: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<ITrade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  addHashtag: (hashtag: string) => void;
  removeHashtag: (hashtag: string) => void;
  getTrade: (id: string) => ITrade | undefined;
  pairs: string[];
  getAllTrades: () => Promise<ITrade[]>;
  addSymbol: (symbol: string) => void;
  tradingAccounts: string[];
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [pairs, setPairs] = useState<string[]>([]);
  const tradingAccounts = ['Demo', 'Main Trading', 'Practice']; // We'll add dynamic accounts later

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const fetchedTrades = await tradeService.getAllTrades();
      setTrades(fetchedTrades);
      
      // Extract unique hashtags from trades
      const hashtags = Array.from(new Set(
        fetchedTrades.flatMap(trade => trade.tags)
      ));
      setAllHashtags(hashtags);
      
      // Extract unique pairs/symbols
      const uniquePairs = Array.from(new Set(
        fetchedTrades.map(trade => trade.symbol)
      ));
      setPairs(uniquePairs.length > 0 ? uniquePairs : ['EURUSD', 'GBPUSD', 'USDJPY']);
      
    } catch (error) {
      console.error('Error fetching trades:', error);
      setError('Failed to fetch trades');
      toast({
        title: "Error",
        description: "Failed to fetch trades",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrade = (id: string): ITrade | undefined => {
    return trades.find(trade => trade.id === id);
  };

  const getAllTrades = async (): Promise<ITrade[]> => {
    return await tradeService.getAllTrades();
  };

  const addSymbol = (symbol: string) => {
    if (!pairs.includes(symbol)) {
      setPairs([...pairs, symbol]);
    }
  };

  const addTrade = async (tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await tradeService.createTrade(tradeData);
      await fetchTrades(); // Refresh trades list
      toast({
        title: "Success",
        description: "Trade added successfully",
      });
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: "Error",
        description: "Failed to add trade",
        variant: "destructive"
      });
    }
  };

  const updateTrade = async (id: string, tradeData: Partial<ITrade>) => {
    try {
      await tradeService.updateTrade(id, tradeData);
      await fetchTrades(); // Refresh trades list
      toast({
        title: "Success",
        description: "Trade updated successfully",
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      toast({
        title: "Error",
        description: "Failed to update trade",
        variant: "destructive"
      });
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      await tradeService.deleteTrade(id);
      await fetchTrades(); // Refresh trades list
      toast({
        title: "Success",
        description: "Trade deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        title: "Error",
        description: "Failed to delete trade",
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

export type { ITrade };
