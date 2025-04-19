
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TradeContextType {
  trades: any[];
  pairs: string[];
  addTrade: (trade: any) => Promise<void>;
  updateTrade: (id: string, trade: any) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
}

const TradeContext = createContext<TradeContextType>({
  trades: [],
  pairs: [],
  addTrade: async () => {},
  updateTrade: async () => {},
  deleteTrade: async () => {},
});

export const useTrade = () => useContext(TradeContext);

export const TradeProvider = ({ children }: { children: React.ReactNode }) => {
  const [trades, setTrades] = useState<any[]>([]);
  const [pairs, setPairs] = useState<string[]>([]);

  useEffect(() => {
    fetchTrades();
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
        setTrades(data);
        // Extract unique pairs from trades
        const uniquePairs = [...new Set(data.map((trade: any) => trade.symbol))];
        setPairs(uniquePairs);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addTrade = async (trade: any) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([trade])
        .select()
        .single();

      if (error) {
        console.error('Error adding trade:', error);
        return;
      }

      if (data) {
        setTrades(prevTrades => [data, ...prevTrades]);
        // Update pairs if new pair is added
        if (!pairs.includes(data.symbol)) {
          setPairs(prevPairs => [...prevPairs, data.symbol]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateTrade = async (id: string, trade: any) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .update(trade)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating trade:', error);
        return;
      }

      if (data) {
        setTrades(prevTrades => 
          prevTrades.map(t => t.id === id ? data : t)
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

  return (
    <TradeContext.Provider value={{ trades, pairs, addTrade, updateTrade, deleteTrade }}>
      {children}
    </TradeContext.Provider>
  );
};
