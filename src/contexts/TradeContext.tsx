
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
  beforeImageUrl: string | null; // Added before image
  afterImageUrl: string | null;  // Added after image
  hashtags: string[];
  createdAt: string;
  commission?: number; // Optional commission field
  instrumentType?: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other'; // Added instrument type
};

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  getTrade: (id: string) => Trade | undefined;
  getAllTrades: () => Trade[];
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

  useEffect(() => {
    if (user) {
      // Load trades and symbols from localStorage
      const allTrades = loadTradesFromStorage();
      const storedSymbols = loadSymbolsFromStorage();
      
      if (storedSymbols.length > 0) {
        setSymbols(storedSymbols);
      }
      
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
  
  const loadSymbolsFromStorage = (): Symbol[] => {
    const storedSymbols = localStorage.getItem('symbols');
    return storedSymbols ? JSON.parse(storedSymbols) : defaultSymbols;
  };
  
  const saveSymbolsToStorage = (symbols: Symbol[]) => {
    localStorage.setItem('symbols', JSON.stringify(symbols));
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

  // Function for admin to get ALL trades from all users
  const getAllTrades = (): Trade[] => {
    return loadTradesFromStorage();
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

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};
