
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Trade } from '@/types/trade';

export const useTrades = (userId: string | undefined) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrades = async () => {
    if (!userId) {
      setTrades([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
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

  const getTrade = (id: string) => trades.find(trade => trade.id === id);
  const getAllTrades = () => trades;

  return {
    trades,
    loading,
    fetchTrades,
    getTrade,
    getAllTrades
  };
};
