
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

export type Trade = {
  id: string;
  userId: string;
  account: string;
  date: string;
  pair: string;
  type: 'Buy' | 'Sell';
  entry: number;
  exit: number;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  riskPercentage: number;
  returnPercentage: number;
  profitLoss: number;
  durationMinutes: number;
  notes: string;
  imageUrl: string | null;
  hashtags: string[];
  createdAt: string;
};

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  getTrade: (id: string) => Trade | undefined;
  loading: boolean;
  accounts: string[];
  pairs: string[];
  allHashtags: string[];
  addHashtag: (hashtag: string) => void;
};

// Sample accounts and pairs data
const sampleAccounts = ['Main Trading', 'Demo Account', 'Savings Account'];
const samplePairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'BTC/USD', 'ETH/USD'];

// Sample data for demonstration purposes
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
    durationMinutes: 240,
    notes: 'Strong momentum after NFP data',
    imageUrl: null,
    hashtags: ['momentum', 'news'],
    createdAt: '2025-04-10T15:30:00Z'
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
    durationMinutes: 120,
    notes: 'Technical breakout from resistance level',
    imageUrl: null,
    hashtags: ['breakout', 'technical'],
    createdAt: '2025-04-09T12:15:00Z'
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
    durationMinutes: 180,
    notes: 'Failed breakout, stopped out',
    imageUrl: null,
    hashtags: ['mistake', 'fakeout'],
    createdAt: '2025-04-08T09:45:00Z'
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
    durationMinutes: 200,
    notes: 'Traded the retracement from daily high',
    imageUrl: null,
    hashtags: ['retracement', 'setup'],
    createdAt: '2025-04-07T14:20:00Z'
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
    durationMinutes: 150,
    notes: 'Bad timing, should have waited for confirmation',
    imageUrl: null,
    hashtags: ['mistake', 'patience'],
    createdAt: '2025-04-06T10:30:00Z'
  }
];

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [allHashtags, setAllHashtags] = useState<string[]>([
    'setup', 'momentum', 'breakout', 'retracement', 'technical', 'fundamental', 
    'news', 'mistake', 'perfecttrade', 'patience', 'fakeout'
  ]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load trades from localStorage
      const allTrades = loadTradesFromStorage();
      
      // Filter trades for current user
      const userTrades = allTrades.filter(trade => trade.userId === user.id);
      
      // If user has no trades and is demo user, provide sample data
      if (userTrades.length === 0 && user.email === 'demo@example.com') {
        // For demo account, use sample trades but update the userId
        const demoTrades = sampleTrades.map(trade => ({
          ...trade,
          userId: user.id
        }));
        
        setTrades(demoTrades);
        // Save demo trades to storage
        saveTradestoStorage([...allTrades.filter(trade => trade.userId !== user.id), ...demoTrades]);
      } else {
        setTrades(userTrades);
      }
      
      // Extract and set all unique hashtags from trades
      const hashtagSet = new Set<string>();
      trades.forEach(trade => {
        trade.hashtags.forEach(tag => hashtagSet.add(tag));
      });
      setAllHashtags(Array.from(hashtagSet).concat(allHashtags));
    } else {
      setTrades([]);
    }
    setLoading(false);
  }, [user]);

  const loadTradesFromStorage = (): Trade[] => {
    const storedTrades = localStorage.getItem('trades');
    return storedTrades ? JSON.parse(storedTrades) : [];
  };

  const saveTradestoStorage = (trades: Trade[]) => {
    localStorage.setItem('trades', JSON.stringify(trades));
  };

  const addTrade = (newTradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newTrade: Trade = {
      ...newTradeData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    // Update local state
    const updatedTrades = [...trades, newTrade];
    setTrades(updatedTrades);
    
    // Update storage with ALL trades (including from other users)
    const allTrades = loadTradesFromStorage();
    saveTradestoStorage([...allTrades.filter(trade => trade.userId !== user.id), ...updatedTrades]);
    
    // Update hashtags
    const newHashtags = newTrade.hashtags.filter(tag => !allHashtags.includes(tag));
    if (newHashtags.length > 0) {
      setAllHashtags([...allHashtags, ...newHashtags]);
    }

    toast({
      title: "Trade Added",
      description: "Your trade has been added successfully",
    });
  };

  const updateTrade = (id: string, tradeUpdate: Partial<Trade>) => {
    if (!user) return;
    
    const tradeIndex = trades.findIndex(t => t.id === id);
    if (tradeIndex === -1) return;

    const updatedTrades = [...trades];
    updatedTrades[tradeIndex] = { ...updatedTrades[tradeIndex], ...tradeUpdate };
    
    // Update local state
    setTrades(updatedTrades);
    
    // Update storage with ALL trades (including from other users)
    const allTrades = loadTradesFromStorage();
    saveTradestoStorage([...allTrades.filter(trade => trade.userId !== user.id), ...updatedTrades]);

    // Update hashtags if they changed
    if (tradeUpdate.hashtags) {
      const newHashtags = tradeUpdate.hashtags.filter(tag => !allHashtags.includes(tag));
      if (newHashtags.length > 0) {
        setAllHashtags([...allHashtags, ...newHashtags]);
      }
    }

    toast({
      title: "Trade Updated",
      description: "Your trade has been updated successfully",
    });
  };

  const deleteTrade = (id: string) => {
    if (!user) return;
    
    // Update local state
    const updatedTrades = trades.filter(trade => trade.id !== id);
    setTrades(updatedTrades);
    
    // Update storage with ALL trades (including from other users)
    const allTrades = loadTradesFromStorage();
    saveTradestoStorage([...allTrades.filter(trade => trade.id !== id)]);

    toast({
      title: "Trade Deleted",
      description: "Your trade has been deleted successfully",
    });
  };

  const getTrade = (id: string) => {
    return trades.find(trade => trade.id === id);
  };

  const addHashtag = (hashtag: string) => {
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags([...allHashtags, hashtag]);
    }
  };

  return (
    <TradeContext.Provider value={{ 
      trades, 
      addTrade, 
      updateTrade, 
      deleteTrade, 
      getTrade,
      loading,
      accounts: sampleAccounts,
      pairs: samplePairs,
      allHashtags,
      addHashtag
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
