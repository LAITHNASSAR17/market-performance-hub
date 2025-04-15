import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { userService } from '@/services/userService';

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

// Add new type for trading accounts
export type TradingAccount = {
  id: string;
  userId: string;
  name: string;
  balance: number;
  createdAt: string;
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
  tradingAccounts: TradingAccount[];
  createTradingAccount: (name: string, balance: number) => Promise<TradingAccount>;
  fetchTradingAccounts: () => Promise<void>;
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
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);

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

  // استرجاع التداولات من Supabase
  useEffect(() => {
    const fetchTrades = async () => {
      if (user) {
        setLoading(true);
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
            account: 'Main Trading', // Default account since it's not in the database
            date: trade.entry_date.split('T')[0],
            pair: trade.symbol,
            type: trade.direction === 'long' ? 'Buy' : 'Sell',
            entry: trade.entry_price,
            exit: trade.exit_price || 0,
            lotSize: trade.quantity,
            stopLoss: null,
            takeProfit: null,
            riskPercentage: 0,
            returnPercentage: 0,
            profitLoss: trade.profit_loss || 0,
            durationMinutes: 0,
            notes: trade.notes || '',
            imageUrl: null,
            beforeImageUrl: null,
            afterImageUrl: null,
            hashtags: trade.tags || [],
            createdAt: trade.created_at,
          }));

          setTrades(formattedTrades);

          // استخراج الهاشتاجات الفريدة
          const uniqueHashtags = Array.from(new Set(
            formattedTrades.flatMap(trade => trade.hashtags)
          ));
          setAllHashtags(prevHashtags => [
            ...prevHashtags,
            ...uniqueHashtags.filter(tag => !prevHashtags.includes(tag))
          ]);
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
      } else {
        setTrades([]);
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user, toast]);

  // تعديل addTrade لإضافة التداول مباشرة إلى Supabase
  const addTrade = async (newTradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          symbol: newTradeData.pair,
          entry_price: newTradeData.entry,
          exit_price: newTradeData.exit,
          quantity: newTradeData.lotSize,
          direction: newTradeData.type === 'Buy' ? 'long' : 'short',
          entry_date: new Date(newTradeData.date).toISOString(),
          exit_date: newTradeData.exit ? new Date(newTradeData.date).toISOString() : null,
          profit_loss: newTradeData.profitLoss,
          fees: 0,
          notes: newTradeData.notes,
          tags: newTradeData.hashtags
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
    }
  };

  // تعديل updateTrade لتحديث التداول مباشرة في Supabase
  const updateTrade = async (id: string, tradeUpdate: Partial<Trade>) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      
      if (tradeUpdate.pair) updateData.symbol = tradeUpdate.pair;
      if (tradeUpdate.entry !== undefined) updateData.entry_price = tradeUpdate.entry;
      if (tradeUpdate.exit !== undefined) updateData.exit_price = tradeUpdate.exit;
      if (tradeUpdate.lotSize !== undefined) updateData.quantity = tradeUpdate.lotSize;
      if (tradeUpdate.type) updateData.direction = tradeUpdate.type === 'Buy' ? 'long' : 'short';
      if (tradeUpdate.date) updateData.entry_date = new Date(tradeUpdate.date).toISOString();
      if (tradeUpdate.exit !== undefined && tradeUpdate.date) {
        updateData.exit_date = tradeUpdate.exit ? new Date(tradeUpdate.date).toISOString() : null;
      }
      if (tradeUpdate.profitLoss !== undefined) updateData.profit_loss = tradeUpdate.profitLoss;
      if (tradeUpdate.notes !== undefined) updateData.notes = tradeUpdate.notes;
      if (tradeUpdate.hashtags) updateData.tags = tradeUpdate.hashtags;

      const { error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === id ? { ...trade, ...tradeUpdate } : trade
        )
      );

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
    }
  };

  // تعديل deleteTrade لحذف التداول مباشرة من Supabase
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

  // Function for admin to get ALL trades from all users
  const getAllTrades = (): Trade[] => {
    return trades;
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
      toast({
        title: "Symbol Added",
        description: `${symbol.name} has been added to your symbols list`,
      });
    }
  };

  // New method to fetch trading accounts
  const fetchTradingAccounts = async () => {
    if (!user) return;

    try {
      // Use the userService to fetch trading accounts
      const accounts = await userService.getTradingAccounts(user.id);
      setTradingAccounts(accounts);
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الحسابات",
        variant: "destructive"
      });
    }
  };

  // New method to create a trading account
  const createTradingAccount = async (name: string, balance: number) => {
    if (!user) throw new Error('User not authenticated');

    // Add validation for account name
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الحساب",
        variant: "destructive"
      });
      throw new Error('Account name is required');
    }

    try {
      // Use userService to create the account
      const newAccount = await userService.createTradingAccount(user.id, name, balance);
      
      // Update the local trading accounts array
      setTradingAccounts(prev => [...prev, newAccount]);
      
      toast({
        title: "حساب جديد",
        description: `تم إنشاء الحساب ${name}`,
      });

      return newAccount;
    } catch (error: any) {
      console.error('Error creating trading account:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Fetch trading accounts on user login
  useEffect(() => {
    if (user) {
      fetchTradingAccounts();
    }
  }, [user]);

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
      calculateProfitLoss,
      tradingAccounts,
      createTradingAccount,
      fetchTradingAccounts,
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
