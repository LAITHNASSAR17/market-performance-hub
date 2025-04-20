
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Trade } from '@/types/trade';
import { tradeService, ITrade } from '@/services/tradeService';
import { useAuth } from '@/contexts/AuthContext';
import { mapTradeToDBTrade, mapDBTradeToTrade } from '@/types/trade';
import { supabase } from '@/lib/supabase';

export const useTradeManagement = (initialTrades: Trade[] = []) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const { user } = useAuth();
  const { toast } = useToast();

  const addTrade = async (newTradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لإضافة تداول",
        variant: "destructive"
      });
      return;
    }

    try {
      const dbTradeData = mapTradeToDBTrade(newTradeData);
      dbTradeData.userId = user.id;
      
      console.log('Creating trade with data:', dbTradeData);
      
      const createdTrade = await tradeService.createTrade(dbTradeData);
      
      console.log('Trade created successfully:', createdTrade);
      
      const newTrade = mapDBTradeToTrade(createdTrade);
      
      setTrades(prevTrades => [newTrade, ...prevTrades]);
      
      toast({
        title: "تم إضافة التداول",
        description: "تم إضافة التداول بنجاح",
      });
      
      return newTrade;
    } catch (error: any) {
      console.error('Error adding trade:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة التداول",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTrade = async (id: string, tradeUpdate: Partial<Trade>) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لتحديث التداول",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const partialDbTrade: Partial<ITrade> = {};
      
      if (tradeUpdate.pair !== undefined) partialDbTrade.symbol = tradeUpdate.pair;
      if (tradeUpdate.entry !== undefined) partialDbTrade.entryPrice = tradeUpdate.entry;
      if (tradeUpdate.exit !== undefined) partialDbTrade.exitPrice = tradeUpdate.exit;
      if (tradeUpdate.lotSize !== undefined) partialDbTrade.quantity = tradeUpdate.lotSize;
      if (tradeUpdate.type !== undefined) partialDbTrade.direction = tradeUpdate.type === 'Buy' ? 'long' : 'short';
      if (tradeUpdate.date !== undefined) partialDbTrade.entryDate = new Date(tradeUpdate.date);
      if (tradeUpdate.profitLoss !== undefined) partialDbTrade.profitLoss = tradeUpdate.profitLoss;
      if (tradeUpdate.notes !== undefined) partialDbTrade.notes = tradeUpdate.notes;
      if (tradeUpdate.hashtags !== undefined) partialDbTrade.tags = tradeUpdate.hashtags;
      if (tradeUpdate.commission !== undefined) partialDbTrade.fees = tradeUpdate.commission;
      if (tradeUpdate.rating !== undefined) partialDbTrade.rating = tradeUpdate.rating;
      if (tradeUpdate.stopLoss !== undefined) partialDbTrade.stopLoss = tradeUpdate.stopLoss;
      if (tradeUpdate.takeProfit !== undefined) partialDbTrade.takeProfit = tradeUpdate.takeProfit;
      if (tradeUpdate.durationMinutes !== undefined) partialDbTrade.durationMinutes = tradeUpdate.durationMinutes;
      if (tradeUpdate.playbook !== undefined) partialDbTrade.playbook = tradeUpdate.playbook;
      if (tradeUpdate.followedRules !== undefined) partialDbTrade.followedRules = tradeUpdate.followedRules;
      if (tradeUpdate.marketSession !== undefined) partialDbTrade.marketSession = tradeUpdate.marketSession;

      if (tradeUpdate.exit !== undefined && tradeUpdate.date) {
        partialDbTrade.exitDate = tradeUpdate.exit ? new Date(tradeUpdate.date) : null;
      }

      const updatedTrade = await tradeService.updateTrade(id, partialDbTrade);
      
      if (!updatedTrade) {
        throw new Error('Failed to update trade');
      }

      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === id ? { ...trade, ...tradeUpdate } : trade
        )
      );

      toast({
        title: "تم تحديث التداول",
        description: "تم تحديث التداول بنجاح",
      });
      
      return mapDBTradeToTrade(updatedTrade);
    } catch (error: any) {
      console.error('Error updating trade:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث التداول",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;
    
    try {
      // First try using the tradeService
      try {
        const success = await tradeService.deleteTrade(id);
        if (!success) throw new Error('Delete operation failed');
      } catch (serviceError) {
        console.warn('Trade service delete failed, falling back to direct supabase call:', serviceError);
        // Fallback to direct Supabase call if tradeService fails
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

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

  return {
    trades,
    setTrades,
    addTrade,
    updateTrade,
    deleteTrade
  };
};
