
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  direction: 'long' | 'short';
  entryDate: Date;
  exitDate?: Date;
  profitLoss?: number;
  fees?: number;
  notes?: string;
  tags: string[];
}

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  getTrade: (id: string) => Trade | undefined;
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) {
        setTrades([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const formattedTrades: Trade[] = data.map(trade => ({
          id: trade.id,
          userId: trade.user_id,
          symbol: trade.symbol,
          entryPrice: trade.entry_price,
          exitPrice: trade.exit_price,
          quantity: trade.quantity,
          direction: trade.direction,
          entryDate: new Date(trade.entry_date),
          exitDate: trade.exit_date ? new Date(trade.exit_date) : undefined,
          profitLoss: trade.profit_loss,
          fees: trade.fees,
          notes: trade.notes,
          tags: trade.tags || []
        }));

        setTrades(formattedTrades);
      } catch (error) {
        console.error('Error fetching trades:', error);
        toast({
          title: "Error",
          description: "Failed to load trades",
          variant: "destructive"
        });
      }
    };

    fetchTrades();
  }, [user, toast]);

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'userId'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          symbol: tradeData.symbol,
          entry_price: tradeData.entryPrice,
          exit_price: tradeData.exitPrice,
          quantity: tradeData.quantity,
          direction: tradeData.direction,
          entry_date: tradeData.entryDate.toISOString(),
          exit_date: tradeData.exitDate?.toISOString(),
          profit_loss: tradeData.profitLoss,
          fees: tradeData.fees,
          notes: tradeData.notes,
          tags: tradeData.tags
        })
        .select()
        .single();

      if (error) throw error;

      const newTrade: Trade = {
        id: data.id,
        userId: data.user_id,
        symbol: data.symbol,
        entryPrice: data.entry_price,
        exitPrice: data.exit_price,
        quantity: data.quantity,
        direction: data.direction,
        entryDate: new Date(data.entry_date),
        exitDate: data.exit_date ? new Date(data.exit_date) : undefined,
        profitLoss: data.profit_loss,
        fees: data.fees,
        notes: data.notes,
        tags: data.tags || []
      };

      setTrades(prev => [...prev, newTrade]);

      toast({
        title: "Trade Added",
        description: "Your trade has been added successfully",
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

  const updateTrade = async (id: string, tradeUpdate: Partial<Trade>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .update({
          symbol: tradeUpdate.symbol,
          entry_price: tradeUpdate.entryPrice,
          exit_price: tradeUpdate.exitPrice,
          quantity: tradeUpdate.quantity,
          direction: tradeUpdate.direction,
          entry_date: tradeUpdate.entryDate?.toISOString(),
          exit_date: tradeUpdate.exitDate?.toISOString(),
          profit_loss: tradeUpdate.profitLoss,
          fees: tradeUpdate.fees,
          notes: tradeUpdate.notes,
          tags: tradeUpdate.tags
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTrades(prev => prev.map(trade => 
        trade.id === id ? {
          ...trade,
          ...tradeUpdate
        } : trade
      ));

      toast({
        title: "Trade Updated",
        description: "Your trade has been updated successfully",
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTrades(prev => prev.filter(trade => trade.id !== id));

      toast({
        title: "Trade Deleted",
        description: "Your trade has been deleted successfully",
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

  const getTrade = (id: string) => {
    return trades.find(trade => trade.id === id);
  };

  return (
    <TradeContext.Provider value={{
      trades,
      addTrade,
      updateTrade,
      deleteTrade,
      getTrade
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
