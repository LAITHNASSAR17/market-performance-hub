import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

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
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  hashtags: string[];
  createdAt: string;
  commission?: number;
  instrumentType?: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other';
};

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  getTrade: (id: string) => Trade | undefined;
  getAllTrades: () => Promise<Trade[]>;
  loading: boolean;
  accounts: string[];
  pairs: string[];
  symbols: Symbol[];
  addSymbol: (symbol: Symbol) => void;
  allHashtags: string[];
  addHashtag: (hashtag: string) => void;
  calculateProfitLoss: (entry: number, exit: number, lotSize: number, type: 'Buy' | 'Sell', instrumentType: string) => number;
};

// Symbol type for the open and dynamic symbol list
export type Symbol = {
  symbol: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other';
};

// Sample accounts
const sampleAccounts = ['Main Trading', 'Demo Account', 'Savings Account'];

// Advanced symbols list with categories
const defaultSymbols: Symbol[] = [
  // Forex
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'forex' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'forex' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', type: 'forex' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', type: 'forex' },
  
  // Cryptocurrencies
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', type: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', type: 'crypto' },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', type: 'crypto' },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', type: 'crypto' },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', type: 'crypto' },
  
  // US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  
  // Saudi Stocks
  { symbol: '2222.SR', name: 'Saudi Aramco', type: 'stock' },
  { symbol: '1120.SR', name: 'Al Rajhi Bank', type: 'stock' },
  { symbol: '2010.SR', name: 'Saudi Basic Industries Corp', type: 'stock' },
  
  // Indices
  { symbol: 'SPX', name: 'S&P 500', type: 'index' },
  { symbol: 'NDX', name: 'Nasdaq 100', type: 'index' },
  { symbol: 'TASI', name: 'Tadawul All Share Index', type: 'index' },
  
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold', type: 'commodity' },
  { symbol: 'XAGUSD', name: 'Silver', type: 'commodity' },
  { symbol: 'CL', name: 'Crude Oil', type: 'commodity' }
];

// Convert symbols to pairs for backward compatibility
const symbolsToPairs = (symbols: Symbol[]): string[] => {
  return symbols.map(symbol => symbol.symbol);
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbols, setSymbols] = useState<Symbol[]>(defaultSymbols);
  const [allHashtags, setAllHashtags] = useState<string[]>([
    'setup', 'momentum', 'breakout', 'retracement', 'technical', 'fundamental', 
    'news', 'mistake', 'perfecttrade', 'patience', 'fakeout'
  ]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate profit/loss based on instrument type
  const calculateProfitLoss = (
    entry: number, 
    exit: number, 
    lotSize: number, 
    type: 'Buy' | 'Sell',
    instrumentType: string = 'forex'
  ): number => {
    // Set multipliers based on instrument type
    let pipValue = 0;
    let pipMultiplier = 1;
    let contractSize = 100000; // Default for forex

    // Determine instrument type from the input or check for specific patterns
    let detectedType = instrumentType.toLowerCase();
    
    if (!detectedType) {
      // Auto-detect instrument type if not provided
      if (/\//.test(instrumentType)) {
        detectedType = 'forex';
      } else if (/^(btc|eth|xrp|ada|dot|sol)/i.test(instrumentType)) {
        detectedType = 'crypto';
      } else if (/\.(sr|sa)$/i.test(instrumentType)) {
        detectedType = 'stock';
      } else if (/^(spx|ndx|dji|ftse|tasi)/i.test(instrumentType)) {
        detectedType = 'index';
      } else if (/^(xau|xag|cl|ng)/i.test(instrumentType)) {
        detectedType = 'commodity';
      } else {
        detectedType = 'stock'; // Default to stock
      }
    }
    
    // Configure calculation parameters based on instrument type
    switch (detectedType) {
      case 'forex':
        contractSize = 100000; // Standard lot size
        
        // Set pip multiplier based on currency pair
        if (instrumentType.includes('JPY')) {
          pipMultiplier = 0.01;
        } else {
          pipMultiplier = 0.0001;
        }
        
        // Calculate pip value
        pipValue = pipMultiplier * contractSize;
        break;
        
      case 'crypto':
        // For crypto, we typically calculate based on direct price difference
        contractSize = 1;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'stock':
        // For stocks, calculate based on share price difference
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'index':
        // For indices, multiplier depends on the specific index
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'commodity':
        // For commodities, contract specifics vary
        if (instrumentType.toUpperCase().includes('XAU')) {
          // Gold is typically $100 per $1 movement per oz
          contractSize = 100;
        } else if (instrumentType.toUpperCase().includes('XAG')) {
          // Silver is typically $50 per $1 movement per oz
          contractSize = 50;
        } else {
          // Default for other commodities
          contractSize = 1000;
        }
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      default:
        // Default calculation for any other instrument
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
    }
    
    // Calculate price difference based on trade type
    const priceDiff = type === 'Buy' 
      ? exit - entry 
      : entry - exit;
    
    // Calculate total profit/loss
    const profitLoss = priceDiff * lotSize * contractSize;
    
    return Math.round(profitLoss * 100) / 100; // Round to 2 decimal places
  };

  // Load trades from Supabase
  const fetchTradesFromSupabase = async (userId?: string) => {
    try {
      let query = supabase.from('trades').select('*');
      
      // If userId is provided, filter by that user
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching trades:', error);
        return [];
      }
      
      // Transform the Supabase data to match our Trade type
      return data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        account: item.account || 'Main Trading',
        date: new Date(item.entry_date).toISOString().split('T')[0],
        pair: item.symbol,
        type: item.direction === 'long' ? 'Buy' : 'Sell',
        entry: item.entry_price,
        exit: item.exit_price || 0,
        lotSize: item.quantity,
        stopLoss: item.stop_loss || null,
        takeProfit: item.take_profit || null,
        riskPercentage: item.risk_percentage || 0,
        returnPercentage: item.return_percentage || 0,
        profitLoss: item.profit_loss || 0,
        durationMinutes: item.duration_minutes || 0,
        notes: item.notes || '',
        imageUrl: item.image_url || null,
        beforeImageUrl: item.before_image_url || null,
        afterImageUrl: item.after_image_url || null,
        hashtags: item.tags || [],
        createdAt: item.created_at,
        commission: item.fees,
        instrumentType: item.instrument_type || 'forex',
      }));
    } catch (error) {
      console.error('Error transforming trades:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // Load trades from Supabase
        const userTrades = await fetchTradesFromSupabase(user.id);
        
        // Load stored symbols from localStorage for backward compatibility
        const storedSymbols = loadSymbolsFromStorage();
        if (storedSymbols.length > 0) {
          setSymbols(storedSymbols);
        }
        
        // If user has no trades and is demo user, provide sample data
        if (userTrades.length === 0 && user.email === 'demo@example.com') {
          // For demo account, use sample trades but update them to Supabase
          const sampleTradesForDemo = sampleTrades.map(trade => ({
            ...trade,
            userId: user.id
          }));
          
          // Save demo trades to Supabase
          for (const trade of sampleTradesForDemo) {
            await addTradeToSupabase(trade);
          }
          
          // Fetch again after adding
          const updatedTrades = await fetchTradesFromSupabase(user.id);
          setTrades(updatedTrades);
        } else {
          setTrades(userTrades);
        }
        
        // Fetch and set hashtags
        const hashtagsData = await fetchHashtags();
        if (hashtagsData.length > 0) {
          setAllHashtags([...new Set([...allHashtags, ...hashtagsData])]);
        }
      } else {
        setTrades([]);
      }
      setLoading(false);
    };
    
    loadData();
  }, [user]);

  // For backward compatibility
  const loadSymbolsFromStorage = (): Symbol[] => {
    const storedSymbols = localStorage.getItem('symbols');
    return storedSymbols ? JSON.parse(storedSymbols) : defaultSymbols;
  };
  
  const saveSymbolsToStorage = (symbols: Symbol[]) => {
    localStorage.setItem('symbols', JSON.stringify(symbols));
  };

  // Fetch hashtags from trades in Supabase
  const fetchHashtags = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('tags');
        
      if (error || !data) {
        console.error('Error fetching hashtags:', error);
        return [];
      }
      
      // Extract and flatten all hashtags
      const allTags: string[] = [];
      data.forEach(item => {
        if (Array.isArray(item.tags)) {
          allTags.push(...item.tags);
        }
      });
      
      // Return unique hashtags
      return [...new Set(allTags)];
    } catch (error) {
      console.error('Error processing hashtags:', error);
      return [];
    }
  };

  // Transform Trade to Supabase format
  const transformTradeForSupabase = (trade: Trade) => {
    return {
      user_id: trade.userId,
      account: trade.account,
      symbol: trade.pair,
      entry_price: trade.entry,
      exit_price: trade.exit,
      quantity: trade.lotSize,
      direction: trade.type === 'Buy' ? 'long' : 'short',
      entry_date: new Date(trade.date).toISOString(),
      exit_date: trade.exit ? new Date(trade.date).toISOString() : null,
      profit_loss: trade.profitLoss,
      fees: trade.commission || 0,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      risk_percentage: trade.riskPercentage,
      return_percentage: trade.returnPercentage,
      duration_minutes: trade.durationMinutes,
      notes: trade.notes,
      tags: trade.hashtags,
      image_url: trade.imageUrl,
      before_image_url: trade.beforeImageUrl,
      after_image_url: trade.afterImageUrl,
      instrument_type: trade.instrumentType || 'forex'
    };
  };

  // Add trade to Supabase
  const addTradeToSupabase = async (trade: Trade) => {
    const supabaseTrade = transformTradeForSupabase(trade);
    
    const { data, error } = await supabase
      .from('trades')
      .insert(supabaseTrade)
      .select();
      
    if (error) {
      console.error('Error adding trade to Supabase:', error);
      throw error;
    }
    
    return data[0];
  };

  const addTrade = async (newTradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    try {
      const newTrade: Trade = {
        ...newTradeData,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };

      // Add to Supabase
      await addTradeToSupabase(newTrade);
      
      // Update local state
      const updatedTrades = await fetchTradesFromSupabase(user.id);
      setTrades(updatedTrades);
      
      // Update hashtags
      const newHashtags = newTrade.hashtags.filter(tag => !allHashtags.includes(tag));
      if (newHashtags.length > 0) {
        setAllHashtags([...allHashtags, ...newHashtags]);
      }

      toast({
        title: "Trade Added",
        description: "Your trade has been added successfully",
      });
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: "Error Adding Trade",
        description: "There was an error adding your trade. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateTrade = async (id: string, tradeUpdate: Partial<Trade>) => {
    if (!user) return;
    
    try {
      const trade = trades.find(t => t.id === id);
      if (!trade) return;
      
      const updatedTrade = { ...trade, ...tradeUpdate };
      
      // Update in Supabase
      const { error } = await supabase
        .from('trades')
        .update(transformTradeForSupabase(updatedTrade))
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedTrades = await fetchTradesFromSupabase(user.id);
      setTrades(updatedTrades);

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
    } catch (error) {
      console.error('Error updating trade:', error);
      toast({
        title: "Error Updating Trade",
        description: "There was an error updating your trade. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedTrades = trades.filter(trade => trade.id !== id);
      setTrades(updatedTrades);

      toast({
        title: "Trade Deleted",
        description: "Your trade has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        title: "Error Deleting Trade",
        description: "There was an error deleting your trade. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTrade = (id: string) => {
    return trades.find(trade => trade.id === id);
  };

  // Function for admin to get ALL trades from all users
  const getAllTrades = async (): Promise<Trade[]> => {
    try {
      const allTrades = await fetchTradesFromSupabase();
      return allTrades;
    } catch (error) {
      console.error('Error getting all trades:', error);
      return [];
    }
  };

  const addHashtag = (hashtag: string) => {
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags([...allHashtags, hashtag]);
    }
  };
  
  const addSymbol = (symbol: Symbol) => {
    // Check if symbol already exists
    if (!symbols.some(s => s.symbol === symbol.symbol)) {
      const updatedSymbols = [...symbols, symbol];
      setSymbols(updatedSymbols);
      saveSymbolsToStorage(updatedSymbols);
      
      toast({
        title: "Symbol Added",
        description: `${symbol.name} has been added to your symbols list`,
      });
    }
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
      accounts: sampleAccounts,
      pairs: symbolsToPairs(symbols),
      symbols,
      addSymbol,
      allHashtags,
      addHashtag,
      calculateProfitLoss
    }}>
      {children}
    </TradeContext.Provider>
  );
};

// Sample data for demonstration purposes - will only be used for demo users with no trades
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
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['momentum', 'news'],
    createdAt: '2025-04-10T15:30:00Z',
    commission: 15
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
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['breakout', 'technical'],
    createdAt: '2025-04-09T12:15:00Z',
    commission: 10
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
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['mistake', 'fakeout'],
    createdAt: '2025-04-08T09:45:00Z',
    commission: 15
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
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['retracement', 'setup'],
    createdAt: '2025-04-07T14:20:00Z',
    commission: 12
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
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: ['mistake', 'patience'],
    createdAt: '2025-04-06T10:30:00Z',
    commission: 10
  }
];

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};
