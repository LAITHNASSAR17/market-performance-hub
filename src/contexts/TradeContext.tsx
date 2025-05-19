
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { Trade } from '@/types/trade';
import { tradeService } from '@/services/tradeService';

export type { Trade } from '@/types/trade';

// Import from the smaller contexts
import { useSymbols } from './SymbolsContext';
import { useHashtags } from './HashtagsContext';
import { useTradingAccounts } from './TradingAccountsContext';
import { useTradeCalculations } from './TradeCalculationsContext';

// Export all the hook types for backwards compatibility
export { useSymbols } from './SymbolsContext';
export { useHashtags } from './HashtagsContext';
export { useTradingAccounts } from './TradingAccountsContext';
export { useTradeCalculations } from './TradeCalculationsContext';

// Sample trades for when no user is logged in
const sampleTrades: Trade[] = [
  {
    id: '1',
    userId: '1',
    account: 'Main Trading',
    date: '2025-04-10',
    pair: 'EUR/USD',
    type: 'Buy',
    entry: 1.1245,
    exit: 1.1305,
    lotSize: 0.5,
    stopLoss: 1.1200,
    takeProfit: 1.1320,
    riskPercentage: 1.5,
    returnPercentage: 2.1,
    profitLoss: 300,
    total: 285,
    durationMinutes: 240,
    notes: 'Strong momentum after NFP data',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['momentum', 'news'],
    createdAt: '2025-04-10T15:30:00Z',
    commission: 15,
    rating: 4
  },
  {
    id: '2',
    userId: '1',
    account: 'Main Trading',
    date: '2025-04-09',
    pair: 'GBP/USD',
    type: 'Sell',
    entry: 1.3310,
    exit: 1.3240,
    lotSize: 0.3,
    stopLoss: 1.3350,
    takeProfit: 1.3240,
    riskPercentage: 1.2,
    returnPercentage: 2.3,
    profitLoss: 210,
    total: 195,
    durationMinutes: 120,
    notes: 'Technical breakout from resistance level',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['breakout', 'technical'],
    createdAt: '2025-04-09T12:15:00Z',
    commission: 10,
    rating: 3
  },
  {
    id: '3',
    userId: '1',
    account: 'Demo Account',
    date: '2025-04-08',
    pair: 'USD/JPY',
    type: 'Buy',
    entry: 107.50,
    exit: 107.20,
    lotSize: 0.7,
    stopLoss: 107.10,
    takeProfit: 108.00,
    riskPercentage: 2.0,
    returnPercentage: -1.5,
    profitLoss: -210,
    total: -195,
    durationMinutes: 180,
    notes: 'Failed breakout, stopped out',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['mistake', 'fakeout'],
    createdAt: '2025-04-08T09:45:00Z',
    commission: 15,
    rating: 2
  },
  {
    id: '4',
    userId: '1',
    account: 'Main Trading',
    date: '2025-04-07',
    pair: 'EUR/USD',
    type: 'Sell',
    entry: 1.1285,
    exit: 1.1240,
    lotSize: 0.6,
    stopLoss: 1.1320,
    takeProfit: 1.1230,
    riskPercentage: 1.8,
    returnPercentage: 2.4,
    profitLoss: 270,
    total: 255,
    durationMinutes: 200,
    notes: 'Traded the retracement from daily high',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['retracement', 'setup'],
    createdAt: '2025-04-07T14:20:00Z',
    commission: 12,
    rating: 5
  },
  {
    id: '5',
    userId: '1',
    account: 'Main Trading',
    date: '2025-04-06',
    pair: 'AUD/USD',
    type: 'Buy',
    entry: 0.7250,
    exit: 0.7190,
    lotSize: 0.5,
    stopLoss: 0.7180,
    takeProfit: 0.7320,
    riskPercentage: 1.5,
    returnPercentage: -3.0,
    profitLoss: -300,
    total: -270,
    durationMinutes: 150,
    notes: 'Bad timing, should have waited for confirmation',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['mistake', 'patience'],
    createdAt: '2025-04-06T10:30:00Z',
    commission: 10,
    rating: 1
  }
];

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  getTrade: (id: string) => Trade | undefined;
  getAllTrades: () => Trade[];
  loading: boolean;
  error: string | null;
  refreshTrades: () => Promise<void>;
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addHashtag } = useHashtags();

  const fetchTrades = async () => {
    if (!user) {
      setTrades(sampleTrades);
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

      // Extract unique hashtags and add them to the HashtagsContext
      const uniqueHashtags = Array.from(new Set(
        formattedTrades.flatMap(trade => trade.hashtags)
      ));
      uniqueHashtags.forEach(tag => addHashtag(tag));
      
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError("حدث خطأ أثناء جلب التداولات");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب التداولات. ستظهر بيانات تداول عينة بدلاً من ذلك.",
        variant: "destructive"
      });
      setTrades(sampleTrades);
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

  const addTrade = async (newTradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    try {
      const entryDate = new Date(newTradeData.date);
      if (isNaN(entryDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          symbol: newTradeData.pair,
          entry_price: newTradeData.entry,
          exit_price: newTradeData.exit || null,
          quantity: newTradeData.lotSize,
          direction: newTradeData.type === 'Buy' ? 'long' : 'short',
          entry_date: entryDate.toISOString(),
          exit_date: newTradeData.exit ? entryDate.toISOString() : null,
          profit_loss: newTradeData.profitLoss - (newTradeData.commission || 0),
          fees: newTradeData.commission || 0,
          notes: newTradeData.notes || '',
          tags: newTradeData.hashtags || [],
          stop_loss: newTradeData.stopLoss || null,
          take_profit: newTradeData.takeProfit || null,
          duration_minutes: newTradeData.durationMinutes || null,
          rating: newTradeData.rating || 0
        })
        .select()
        .single();

      if (error) throw error;

      const newTrade: Trade = {
        ...newTradeData,
        id: data.id,
        userId: user.id,
        createdAt: data.created_at,
      };

      setTrades(prevTrades => [newTrade, ...prevTrades]);
      
      // Add any new hashtags to the global list
      if (newTradeData.hashtags) {
        newTradeData.hashtags.forEach(tag => addHashtag(tag));
      }

      toast({
        title: "تم إضافة التداول",
        description: "تم إضافة التداول بنجاح",
      });
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التداول",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTrade = async (id: string, tradeUpdate: Partial<Trade>) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      
      if (tradeUpdate.pair !== undefined) updateData.symbol = tradeUpdate.pair;
      if (tradeUpdate.entry !== undefined) updateData.entry_price = tradeUpdate.entry;
      if (tradeUpdate.exit !== undefined) updateData.exit_price = tradeUpdate.exit;
      if (tradeUpdate.lotSize !== undefined) updateData.quantity = tradeUpdate.lotSize;
      if (tradeUpdate.type !== undefined) updateData.direction = tradeUpdate.type === 'Buy' ? 'long' : 'short';
      if (tradeUpdate.date !== undefined) updateData.entry_date = new Date(tradeUpdate.date).toISOString();
      if (tradeUpdate.profitLoss !== undefined) updateData.profit_loss = tradeUpdate.profitLoss;
      if (tradeUpdate.notes !== undefined) updateData.notes = tradeUpdate.notes;
      if (tradeUpdate.hashtags !== undefined) updateData.tags = tradeUpdate.hashtags;
      if (tradeUpdate.commission !== undefined) updateData.fees = tradeUpdate.commission;
      if (tradeUpdate.rating !== undefined) updateData.rating = tradeUpdate.rating;
      if (tradeUpdate.stopLoss !== undefined) updateData.stop_loss = tradeUpdate.stopLoss;
      if (tradeUpdate.takeProfit !== undefined) updateData.take_profit = tradeUpdate.takeProfit;
      if (tradeUpdate.durationMinutes !== undefined) updateData.duration_minutes = tradeUpdate.durationMinutes;
      
      if (tradeUpdate.exit !== undefined && tradeUpdate.date) {
        updateData.exit_date = tradeUpdate.exit ? new Date(tradeUpdate.date).toISOString() : null;
      }

      console.log('Updating trade with data:', updateData);

      const { data, error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === id ? { ...trade, ...tradeUpdate } : trade
        )
      );

      // Add any new hashtags to the global list
      if (tradeUpdate.hashtags) {
        tradeUpdate.hashtags.forEach(tag => addHashtag(tag));
      }

      toast({
        title: "تم تحديث التداول",
        description: "تم تحديث التداول بنجاح",
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث التداول",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTrades(prevTrades => prevTrades.filter(trade => trade.id !== id));

      toast({
        title: "تم حذف التداول",
        description: "تم حذف التداول بنجاح",
      });
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التداول",
        variant: "destructive"
      });
    }
  };

  const getTrade = (id: string) => {
    return trades.find(trade => trade.id === id);
  };

  const getAllTrades = (): Trade[] => {
    return trades;
  };

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
      refreshTrades
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
