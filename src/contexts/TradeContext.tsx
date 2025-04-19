
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the Trade type that will be exported
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

interface TradeContextType {
  trades: Trade[];
  pairs: string[];
  tradingAccounts: any[];
  accounts: any[];
  allHashtags: string[];
  addTrade: (trade: any) => Promise<void>;
  updateTrade: (id: string, trade: any) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  getTrade: (id: string) => Trade | undefined;
  getAllTrades: () => Trade[];
  addHashtag: (tag: string) => void;
  addSymbol: (symbol: string) => void;
}

const TradeContext = createContext<TradeContextType>({
  trades: [],
  pairs: [],
  tradingAccounts: [],
  accounts: [],
  allHashtags: [],
  addTrade: async () => {},
  updateTrade: async () => {},
  deleteTrade: async () => {},
  getTrade: () => undefined,
  getAllTrades: () => [],
  addHashtag: () => {},
  addSymbol: () => {},
});

export const useTrade = () => useContext(TradeContext);

export const TradeProvider = ({ children }: { children: React.ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pairs, setPairs] = useState<string[]>([]);
  const [tradingAccounts, setTradingAccounts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);

  useEffect(() => {
    fetchTrades();
    fetchAccounts();
    fetchHashtags();
  }, []);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      if (data) {
        // Transform the data to match our Trade interface
        const transformedTrades = data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          pair: item.symbol,
          symbol: item.symbol,
          type: item.direction === 'long' ? 'Buy' : 'Sell',
          entry: item.entry_price,
          exit: item.exit_price,
          lotSize: item.quantity,
          stopLoss: item.stop_loss,
          takeProfit: item.take_profit,
          riskPercentage: 0, // Calculate or set default
          returnPercentage: 0, // Calculate or set default
          profitLoss: item.profit_loss || 0,
          durationMinutes: item.duration_minutes,
          notes: item.notes || '',
          date: item.entry_date ? new Date(item.entry_date).toISOString().split('T')[0] : '',
          account: 'Main Trading', // Default account
          imageUrl: item.image_url,
          beforeImageUrl: item.before_image_url,
          afterImageUrl: item.after_image_url,
          hashtags: item.tags || [],
          createdAt: item.created_at,
          commission: item.fees || 0,
          rating: item.rating || 0,
          total: (item.profit_loss || 0) - (item.fees || 0),
          playbook: item.playbook,
          followedRules: item.followed_rules,
          marketSession: item.market_session
        }));

        setTrades(transformedTrades);
        
        // Extract unique pairs from trades
        const uniquePairs = [...new Set(data.map((trade: any) => trade.symbol))];
        setPairs(uniquePairs);
        
        // Extract unique hashtags from trades
        const hashtags = data.flatMap((trade: any) => trade.tags || []);
        const uniqueHashtags = [...new Set(hashtags)];
        setAllHashtags(uniqueHashtags);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*');

      if (error) {
        console.error('Error fetching accounts:', error);
        return;
      }

      if (data) {
        setTradingAccounts(data);
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchHashtags = async () => {
    try {
      // Get all unique hashtags from trades
      const { data, error } = await supabase
        .from('trades')
        .select('tags');

      if (error) {
        console.error('Error fetching hashtags:', error);
        return;
      }

      if (data) {
        const allTags = data.flatMap(item => item.tags || []);
        const uniqueTags = [...new Set(allTags)];
        setAllHashtags(uniqueTags);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addTrade = async (trade: any) => {
    try {
      // Transform trade data to match database schema
      const dbTrade = {
        user_id: trade.userId || null,
        symbol: trade.pair,
        entry_price: trade.entry,
        exit_price: trade.exit,
        quantity: trade.lotSize,
        direction: trade.type === 'Buy' ? 'long' : 'short',
        entry_date: trade.date ? new Date(trade.date).toISOString() : new Date().toISOString(),
        exit_date: trade.exit ? new Date(trade.date).toISOString() : null,
        profit_loss: trade.profitLoss,
        fees: trade.commission || 0,
        notes: trade.notes || '',
        tags: trade.hashtags || [],
        rating: trade.rating || 0,
        stop_loss: trade.stopLoss || null,
        take_profit: trade.takeProfit || null,
        duration_minutes: trade.durationMinutes || null,
        market_session: trade.marketSession,
        playbook: trade.playbook,
        followed_rules: trade.followedRules
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([dbTrade])
        .select()
        .single();

      if (error) {
        console.error('Error adding trade:', error);
        return;
      }

      if (data) {
        // Transform back to our Trade interface
        const newTrade: Trade = {
          id: data.id,
          userId: data.user_id,
          pair: data.symbol,
          symbol: data.symbol,
          type: data.direction === 'long' ? 'Buy' : 'Sell',
          entry: data.entry_price,
          exit: data.exit_price,
          lotSize: data.quantity,
          stopLoss: data.stop_loss,
          takeProfit: data.take_profit,
          riskPercentage: 0,
          returnPercentage: 0,
          profitLoss: data.profit_loss || 0,
          durationMinutes: data.duration_minutes,
          notes: data.notes || '',
          date: data.entry_date ? new Date(data.entry_date).toISOString().split('T')[0] : '',
          account: 'Main Trading',
          imageUrl: data.image_url,
          beforeImageUrl: data.before_image_url,
          afterImageUrl: data.after_image_url,
          hashtags: data.tags || [],
          createdAt: data.created_at,
          commission: data.fees || 0,
          rating: data.rating || 0,
          total: (data.profit_loss || 0) - (data.fees || 0),
          playbook: data.playbook,
          followedRules: data.followed_rules,
          marketSession: data.market_session
        };
        
        setTrades(prevTrades => [newTrade, ...prevTrades]);
        
        // Update pairs if new pair is added
        if (!pairs.includes(data.symbol)) {
          setPairs(prevPairs => [...prevPairs, data.symbol]);
        }
        
        // Update hashtags if new ones are added
        const newHashtags = trade.hashtags?.filter((tag: string) => !allHashtags.includes(tag)) || [];
        if (newHashtags.length > 0) {
          setAllHashtags(prev => [...prev, ...newHashtags]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateTrade = async (id: string, trade: any) => {
    try {
      // Transform trade data to match database schema
      const updateData: Record<string, any> = {};
      if (trade.pair !== undefined) updateData.symbol = trade.pair;
      if (trade.entry !== undefined) updateData.entry_price = trade.entry;
      if (trade.exit !== undefined) updateData.exit_price = trade.exit;
      if (trade.lotSize !== undefined) updateData.quantity = trade.lotSize;
      if (trade.type !== undefined) updateData.direction = trade.type === 'Buy' ? 'long' : 'short';
      if (trade.date !== undefined) updateData.entry_date = new Date(trade.date).toISOString();
      if (trade.exit !== undefined && trade.date !== undefined) updateData.exit_date = trade.exit ? new Date(trade.date).toISOString() : null;
      if (trade.profitLoss !== undefined) updateData.profit_loss = trade.profitLoss;
      if (trade.commission !== undefined) updateData.fees = trade.commission;
      if (trade.notes !== undefined) updateData.notes = trade.notes;
      if (trade.hashtags !== undefined) updateData.tags = trade.hashtags;
      if (trade.rating !== undefined) updateData.rating = trade.rating;
      if (trade.stopLoss !== undefined) updateData.stop_loss = trade.stopLoss;
      if (trade.takeProfit !== undefined) updateData.take_profit = trade.takeProfit;
      if (trade.durationMinutes !== undefined) updateData.duration_minutes = trade.durationMinutes;
      if (trade.marketSession !== undefined) updateData.market_session = trade.marketSession;
      if (trade.playbook !== undefined) updateData.playbook = trade.playbook;
      if (trade.followedRules !== undefined) updateData.followed_rules = trade.followedRules;

      const { data, error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating trade:', error);
        return;
      }

      if (data) {
        // Transform back to our Trade interface
        const updatedTrade: Trade = {
          id: data.id,
          userId: data.user_id,
          pair: data.symbol,
          symbol: data.symbol,
          type: data.direction === 'long' ? 'Buy' : 'Sell',
          entry: data.entry_price,
          exit: data.exit_price,
          lotSize: data.quantity,
          stopLoss: data.stop_loss,
          takeProfit: data.take_profit,
          riskPercentage: 0,
          returnPercentage: 0,
          profitLoss: data.profit_loss || 0,
          durationMinutes: data.duration_minutes,
          notes: data.notes || '',
          date: data.entry_date ? new Date(data.entry_date).toISOString().split('T')[0] : '',
          account: 'Main Trading',
          imageUrl: data.image_url,
          beforeImageUrl: data.before_image_url,
          afterImageUrl: data.after_image_url,
          hashtags: data.tags || [],
          createdAt: data.created_at,
          commission: data.fees || 0,
          rating: data.rating || 0,
          total: (data.profit_loss || 0) - (data.fees || 0),
          playbook: data.playbook,
          followedRules: data.followed_rules,
          marketSession: data.market_session
        };
        
        setTrades(prevTrades => 
          prevTrades.map(t => t.id === id ? updatedTrade : t)
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting trade:', error);
        return;
      }

      setTrades(prevTrades => prevTrades.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getTrade = (id: string) => {
    return trades.find(trade => trade.id === id);
  };

  const getAllTrades = () => {
    return trades;
  };

  const addHashtag = (tag: string) => {
    if (!allHashtags.includes(tag)) {
      setAllHashtags(prev => [...prev, tag]);
    }
  };

  const addSymbol = (symbol: string) => {
    if (!pairs.includes(symbol)) {
      setPairs(prev => [...prev, symbol]);
    }
  };

  return (
    <TradeContext.Provider 
      value={{ 
        trades, 
        pairs, 
        tradingAccounts, 
        accounts, 
        allHashtags,
        addTrade, 
        updateTrade, 
        deleteTrade,
        getTrade,
        getAllTrades,
        addHashtag,
        addSymbol
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};
