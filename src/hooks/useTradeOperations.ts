
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Trade } from '@/types/trade';

export const useTradeOperations = (userId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const addTrade = async (newTradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const entryDate = new Date(newTradeData.date);
      if (isNaN(entryDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: userId,
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

      toast({
        title: "تم إضافة التداول",
        description: "تم إضافة التداول بنجاح",
      });

      return data;
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
    if (!userId) return;
    
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

      const { data, error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم تحديث التداول",
        description: "تم تحديث التداول بنجاح",
      });

      return data;
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
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

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

  return {
    loading,
    setLoading,
    addTrade,
    updateTrade,
    deleteTrade
  };
};
