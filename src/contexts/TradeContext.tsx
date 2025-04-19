
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trade } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

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
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTrades: Trade[] = data.map(trade => ({
        id: trade.id,
        userId: trade.user_id,
        pair: trade.symbol,
        symbol: trade.symbol,
        type: trade.direction as 'Buy' | 'Sell',
        entry: trade.entry_price,
        exit: trade.exit_price,
        lotSize: trade.quantity,
        stopLoss: trade.stop_loss,
        takeProfit: trade.take_profit,
        riskPercentage: 0, // Calculate or get from trade
        returnPercentage: 0, // Calculate or get from trade
        profitLoss: trade.profit_loss || 0,
        durationMinutes: trade.duration_minutes,
        notes: trade.notes || '',
        date: trade.entry_date,
        account: 'Demo', // Get from trade or user preferences
        imageUrl: trade.image_url,
        beforeImageUrl: trade.before_image_url,
        afterImageUrl: trade.after_image_url,
        hashtags: trade.tags || [],
        createdAt: trade.created_at,
        commission: trade.fees || 0,
        rating: trade.rating || 0,
        total: trade.profit_loss || 0,
        playbook: trade.playbook,
        followedRules: trade.followed_rules,
        marketSession: trade.market_session
      }));

      setTrades(formattedTrades);
      
      // Extract unique hashtags
      const hashtags = Array.from(new Set(
        formattedTrades.flatMap(trade => trade.hashtags)
      ));
      setAllHashtags(hashtags);
      
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

  const addTrade = async (trade: Omit<Trade, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: trade.userId,
          symbol: trade.symbol,
          direction: trade.type,
          entry_price: trade.entry,
          exit_price: trade.exit,
          quantity: trade.lotSize,
          stop_loss: trade.stopLoss,
          take_profit: trade.takeProfit,
          profit_loss: trade.profitLoss,
          duration_minutes: trade.durationMinutes,
          notes: trade.notes,
          entry_date: trade.date,
          image_url: trade.imageUrl,
          before_image_url: trade.beforeImageUrl,
          after_image_url: trade.afterImageUrl,
          tags: trade.hashtags,
          fees: trade.commission,
          rating: trade.rating,
          playbook: trade.playbook,
          followed_rules: trade.followedRules,
          market_session: trade.marketSession
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await fetchTrades(); // Refresh trades list
        toast({
          title: "Success",
          description: "Trade added successfully",
        });
      }
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: "Error",
        description: "Failed to add trade",
        variant: "destructive"
      });
    }
  };

  const updateTrade = async (id: string, trade: Partial<Trade>) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update({
          symbol: trade.symbol,
          direction: trade.type,
          entry_price: trade.entry,
          exit_price: trade.exit,
          quantity: trade.lotSize,
          stop_loss: trade.stopLoss,
          take_profit: trade.takeProfit,
          profit_loss: trade.profitLoss,
          duration_minutes: trade.durationMinutes,
          notes: trade.notes,
          entry_date: trade.date,
          image_url: trade.imageUrl,
          before_image_url: trade.beforeImageUrl,
          after_image_url: trade.afterImageUrl,
          tags: trade.hashtags,
          fees: trade.commission,
          rating: trade.rating,
          playbook: trade.playbook,
          followed_rules: trade.followedRules,
          market_session: trade.marketSession,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
        removeHashtag
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
