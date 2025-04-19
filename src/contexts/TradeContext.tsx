import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { Trade } from '@/types/trade';
import { tradeService } from '@/services/tradeService';
import { userService } from '@/services/userService';

export type { Trade } from '@/types/trade';

export type TradingAccount = {
  id: string;
  userId: string;
  name: string;
  balance: number;
  createdAt: string;
};

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
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

export type Symbol = {
  symbol: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other';
};

const sampleAccounts = ['Main Trading', 'Demo Account', 'Savings Account'];

const defaultSymbols: Symbol[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'forex' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'forex' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', type: 'forex' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', type: 'forex' },
  
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', type: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', type: 'crypto' },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', type: 'crypto' },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', type: 'crypto' },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', type: 'crypto' },
  
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  
  { symbol: '2222.SR', name: 'Saudi Aramco', type: 'stock' },
  { symbol: '1120.SR', name: 'Al Rajhi Bank', type: 'stock' },
  { symbol: '2010.SR', name: 'Saudi Basic Industries Corp', type: 'stock' },
  
  { symbol: 'SPX', name: 'S&P 500', type: 'index' },
  { symbol: 'NDX', name: 'Nasdaq 100', type: 'index' },
  { symbol: 'TASI', name: 'Tadawul All Share Index', type: 'index' },
  
  { symbol: 'XAUUSD', name: 'Gold', type: 'commodity' },
  { symbol: 'XAGUSD', name: 'Silver', type: 'commodity' },
  { symbol: 'CL', name: 'Crude Oil', type: 'commodity' }
];

const symbolsToPairs = (symbols: Symbol[]): string[] => {
  return symbols.map(symbol => symbol.symbol);
};

const formatTrade = (data: any): Trade => {
  try {
    const formatBase: Trade = {
      id: data.id,
      userId: data.user_id,
      symbol: data.symbol,
      entryPrice: data.entry_price,
      exitPrice: data.exit_price,
      quantity: data.quantity,
      direction: data.direction,
      entryDate: data.entry_date ? new Date(data.entry_date) : new Date(),
      exitDate: data.exit_date ? new Date(data.exit_date) : null,
      profitLoss: data.profit_loss,
      fees: data.fees || 0,
      notes: data.notes || '',
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at || data.created_at),
      rating: data.rating || 0,
      stopLoss: data.stop_loss,
      takeProfit: data.take_profit,
      durationMinutes: data.duration_minutes,
      accountId: data.account_id,
      imageUrl: data.image_url,
      beforeImageUrl: data.before_image_url,
      afterImageUrl: data.after_image_url,
      riskPercentage: data.risk_percentage || 0,
      returnPercentage: data.return_percentage || 0,
    };

    if (data.playbook) {
      formatBase.playbook = data.playbook;
    }

    if (data.followed_rules) {
      formatBase.followedRules = data.followed_rules;
    }
    
    if (data.market_session) {
      formatBase.marketSession = data.market_session;
    }

    formatBase.date = data.entry_date ? data.entry_date.split('T')[0] : new Date().toISOString().split('T')[0];
    formatBase.pair = data.symbol;
    formatBase.entry = data.entry_price;
    formatBase.exit = data.exit_price;
    formatBase.type = data.direction === 'long' ? 'Buy' : 'Sell';
    formatBase.account = 'Main Trading';
    formatBase.lotSize = data.quantity;
    formatBase.total = (data.profit_loss || 0) - (data.fees || 0);
    formatBase.hashtags = data.tags || [];
    formatBase.commission = data.fees;
    
    return formatBase;
  } catch (err) {
    console.error('Error formatting trade:', err, data);
    throw err;
  }
};

const sampleTrades: Trade[] = [
  {
    id: '1',
    userId: '1',
    symbol: 'EUR/USD',
    entryPrice: 1.1245,
    exitPrice: 1.1305,
    quantity: 0.5,
    direction: 'long',
    entryDate: new Date('2025-04-10'),
    exitDate: new Date('2025-04-10'),
    profitLoss: 300,
    fees: 15,
    notes: 'Strong momentum after NFP data',
    tags: ['momentum', 'news'],
    createdAt: new Date('2025-04-10T15:30:00Z'),
    updatedAt: new Date('2025-04-10T15:30:00Z'),
    rating: 4,
    stopLoss: 1.1200,
    takeProfit: 1.1320,
    durationMinutes: 240,
    riskPercentage: 2.5,
    returnPercentage: 3.2,
    // Compatibility fields
    date: '2025-04-10',
    pair: 'EUR/USD',
    type: 'Buy',
    entry: 1.1245,
    exit: 1.1305,
    account: 'Main Trading',
    lotSize: 0.5,
    total: 285,
    hashtags: ['momentum', 'news'],
    commission: 15,
  },
  {
    id: '2',
    userId: '1',
    symbol: 'GBP/USD',
    entryPrice: 1.3310,
    exitPrice: 1.3240,
    quantity: 0.3,
    direction: 'short',
    entryDate: new Date('2025-04-09'),
    exitDate: new Date('2025-04-09'),
    profitLoss: 210,
    fees: 10,
    notes: 'Technical breakout from resistance level',
    tags: ['breakout', 'technical'],
    createdAt: new Date('2025-04-09T12:15:00Z'),
    updatedAt: new Date('2025-04-09T12:15:00Z'),
    rating: 3,
    stopLoss: 1.3350,
    takeProfit: 1.3240,
    durationMinutes: 120,
    // Compatibility fields
    date: '2025-04-09',
    pair: 'GBP/USD',
    type: 'Sell',
    entry: 1.3310,
    exit: 1.3240,
    account: 'Main Trading',
    lotSize: 0.3,
    total: 195,
    hashtags: ['breakout', 'technical'],
  },
  {
    id: '3',
    userId: '1',
    symbol: 'USD/JPY',
    entryPrice: 107.50,
    exitPrice: 107.20,
    quantity: 0.7,
    direction: 'long',
    entryDate: new Date('2025-04-08'),
    exitDate: new Date('2025-04-08'),
    profitLoss: -210,
    fees: 15,
    notes: 'Failed breakout, stopped out',
    tags: ['mistake', 'fakeout'],
    createdAt: new Date('2025-04-08T09:45:00Z'),
    updatedAt: new Date('2025-04-08T09:45:00Z'),
    rating: 2,
    stopLoss: 107.10,
    takeProfit: 108.00,
    durationMinutes: 180,
    // Compatibility fields
    date: '2025-04-08',
    pair: 'USD/JPY',
    type: 'Buy',
    entry: 107.50,
    exit: 107.20,
    account: 'Demo Account',
    lotSize: 0.7,
    total: -195,
    hashtags: ['mistake', 'fakeout'],
  },
  {
    id: '4',
    userId: '1',
    symbol: 'EUR/USD',
    entryPrice: 1.1285,
    exitPrice: 1.1240,
    quantity: 0.6,
    direction: 'short',
    entryDate: new Date('2025-04-07'),
    exitDate: new Date('2025-04-07'),
    profitLoss: 270,
    fees: 12,
    notes: 'Traded the retracement from daily high',
    tags: ['retracement', 'setup'],
    createdAt: new Date('2025-04-07T14:20:00Z'),
    updatedAt: new Date('2025-04-07T14:20:00Z'),
    rating: 5,
    stopLoss: 1.1320,
    takeProfit: 1.1230,
    durationMinutes: 200,
    // Compatibility fields
    date: '2025-04-07',
    pair: 'EUR/USD',
    type: 'Sell',
    entry: 1.1285,
    exit: 1.1240,
    account: 'Main Trading',
    lotSize: 0.6,
    total: 255,
    hashtags: ['retracement', 'setup'],
  },
  {
    id: '5',
    userId: '1',
    symbol: 'AUD/USD',
    entryPrice: 0.7250,
    exitPrice: 0.7190,
    quantity: 0.5,
    direction: 'long',
    entryDate: new Date('2025-04-06'),
    exitDate: new Date('2025-04-06'),
    profitLoss: -300,
    fees: 10,
    notes: 'Bad timing, should have waited for confirmation',
    tags: ['mistake', 'patience'],
    createdAt: new Date('2025-04-06T10:30:00Z'),
    updatedAt: new Date('2025-04-06T10:30:00Z'),
    rating: 1,
    stopLoss: 0.7180,
    takeProfit: 0.7320,
    durationMinutes: 150,
    // Compatibility fields
    date: '2025-04-06',
    pair: 'AUD/USD',
    type: 'Buy',
    entry: 0.7250,
    exit: 0.7190,
    account: 'Main Trading',
    lotSize: 0.5,
    total: -270,
    hashtags: ['mistake', 'patience'],
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
  const [isLoading, setIsLoading] = useState(false);

  const calculateProfitLoss = (
    entry: number, 
    exit: number, 
    lotSize: number, 
    type: 'Buy' | 'Sell',
    instrumentType: string = 'forex'
  ): number => {
    let pipValue = 0;
    let pipMultiplier = 1;
    let contractSize = 100000;

    let detectedType = instrumentType.toLowerCase();
    
    if (!detectedType) {
      if (/\//.test(instrumentType)) {
        detectedType = 'forex';
      } else if (/^(btc|eth|xrp|ada|dot|sol)/i.test(instrumentType)) {
        detectedType = 'crypto';
      } else if (/^(sr|sa)$/i.test(instrumentType)) {
        detectedType = 'stock';
      } else if (/^(spx|ndx|dji|ftse|tasi)/i.test(instrumentType)) {
        detectedType = 'index';
      } else if (/^(xau|xag|cl|ng)/i.test(instrumentType)) {
        detectedType = 'commodity';
      } else {
        detectedType = 'stock';
      }
    }
    
    switch (detectedType) {
      case 'forex':
        contractSize = 100000;
        
        if (instrumentType.includes('JPY')) {
          pipMultiplier = 0.01;
        } else {
          pipMultiplier = 0.0001;
        }
        
        pipValue = pipMultiplier * contractSize;
        break;
        
      case 'crypto':
        contractSize = 1;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'stock':
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'index':
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      case 'commodity':
        if (instrumentType.toUpperCase().includes('XAU')) {
          contractSize = 100;
        } else if (instrumentType.toUpperCase().includes('XAG')) {
          contractSize = 50;
        } else {
          contractSize = 1000;
        }
        pipMultiplier = 1;
        pipValue = 1;
        break;
        
      default:
        contractSize = lotSize;
        pipMultiplier = 1;
        pipValue = 1;
    }
    
    const priceDiff = type === 'Buy' 
      ? exit - entry 
      : entry - exit;
    
    const profitLoss = priceDiff * lotSize * contractSize;
    
    return Math.round(profitLoss * 100) / 100;
  };

  useEffect(() => {
    const fetchTrades = async () => {
      if (user) {
        setLoading(true);
        try {
          console.log('Fetching trades for user:', user.id);
          
          const { data, error } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching trades:', error);
            throw error;
          }

          if (!data) {
            console.log('No trade data returned');
            setTrades([]);
            return;
          }

          console.log('Fetched trades data:', data);
          const formattedTrades: Trade[] = data.map(trade => {
            const formattedTrade: Trade = {
              id: trade.id,
              userId: trade.user_id,
              account: 'Main Trading',
              date: trade.entry_date ? trade.entry_date.split('T')[0] : new Date().toISOString().split('T')[0],
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
              rating: trade.rating || 0,
              playbook: trade.playbook,
              followedRules: trade.followed_rules || [],
              accountId: trade.account_id
            };
            
            if (trade.market_session) {
              formattedTrade.marketSession = trade.market_session;
            }
            
            return formatTrade(formattedTrade);
          });

          console.log('Formatted trades:', formattedTrades);
          setTrades(formattedTrades);

          const uniqueHashtags = Array.from(new Set(
            formattedTrades.flatMap(trade => trade.hashtags)
          ));
          setAllHashtags(prevHashtags => [
            ...prevHashtags,
            ...uniqueHashtags.filter(tag => !prevHashtags.includes(tag))
          ]);
        } catch (error) {
          console.error('Exception in fetchTrades:', error);
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

  const addTrade = async (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    setIsLoading(true);
    
    try {
      const user = supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      
      const dbTrade = {
        user_id: user.id,
        symbol: trade.symbol || trade.pair,
        entry_price: trade.entryPrice || trade.entry,
        exit_price: trade.exitPrice || trade.exit,
        quantity: trade.quantity || trade.lotSize,
        direction: trade.direction || (trade.type === 'Buy' ? 'long' : 'short'),
        entry_date: trade.entryDate ? trade.entryDate.toISOString() : (trade.date ? new Date(trade.date).toISOString() : new Date().toISOString()),
        exit_date: trade.exitDate ? trade.exitDate.toISOString() : null,
        profit_loss: trade.profitLoss,
        fees: trade.fees || trade.commission || 0,
        notes: trade.notes,
        tags: trade.tags || trade.hashtags || [],
        rating: trade.rating || 0,
        stop_loss: trade.stopLoss,
        take_profit: trade.takeProfit,
        duration_minutes: trade.durationMinutes,
        playbook: trade.playbook,
        followed_rules: trade.followedRules || [],
        market_session: trade.marketSession,
        account_id: trade.accountId,
        risk_percentage: trade.riskPercentage || 0,
        return_percentage: trade.returnPercentage || 0
      };
      
      const result = await tradeService.createTrade(dbTrade);
      
      if (result.error) throw result.error;
      
      const newTrade = formatTrade(result);
      setTrades(prev => [...prev, newTrade]);
      
      toast({
        title: 'Success',
        description: 'Trade added successfully',
      });
      
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: 'Error',
        description: 'Failed to add trade',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrade = async (id: string, trade: Partial<Trade>): Promise<void> => {
    setIsLoading(true);
    
    try {
      const updateObj: any = {};
      
      if (trade.symbol || trade.pair) updateObj.symbol = trade.symbol || trade.pair;
      if (trade.entryPrice || trade.entry) updateObj.entry_price = trade.entryPrice || trade.entry;
      if (trade.exitPrice || trade.exit) updateObj.exit_price = trade.exitPrice || trade.exit;
      if (trade.quantity || trade.lotSize) updateObj.quantity = trade.quantity || trade.lotSize;
      if (trade.direction || trade.type) updateObj.direction = trade.direction || (trade.type === 'Buy' ? 'long' : 'short');
      
      if (trade.entryDate || trade.date) {
        updateObj.entry_date = trade.entryDate 
          ? (trade.entryDate instanceof Date ? trade.entryDate.toISOString() : new Date(trade.entryDate).toISOString())
          : (trade.date ? new Date(trade.date).toISOString() : undefined);
      }
      
      if (trade.exitDate) {
        updateObj.exit_date = trade.exitDate instanceof Date ? trade.exitDate.toISOString() : new Date(trade.exitDate).toISOString();
      }
      
      if (trade.profitLoss !== undefined) updateObj.profit_loss = trade.profitLoss;
      if (trade.fees !== undefined || trade.commission !== undefined) updateObj.fees = trade.fees || trade.commission || 0;
      if (trade.notes !== undefined) updateObj.notes = trade.notes;
      if (trade.tags || trade.hashtags) updateObj.tags = trade.tags || trade.hashtags;
      if (trade.rating !== undefined) updateObj.rating = trade.rating;
      if (trade.stopLoss !== undefined) updateObj.stop_loss = trade.stopLoss;
      if (trade.takeProfit !== undefined) updateObj.take_profit = trade.takeProfit;
      if (trade.durationMinutes !== undefined) updateObj.duration_minutes = trade.durationMinutes;
      if (trade.playbook !== undefined) updateObj.playbook = trade.playbook;
      if (trade.followedRules !== undefined) updateObj.followed_rules = trade.followedRules;
      if (trade.marketSession !== undefined) updateObj.market_session = trade.marketSession;
      if (trade.accountId !== undefined) updateObj.account_id = trade.accountId;
      
      const { error: updateError } = await tradeService.updateTrade(id, updateObj);
      
      if (updateError) throw updateError;
      
      setTrades(prev => prev.map(t => t.id === id ? { ...t, ...trade } : t));
      
      toast({
        title: 'Success',
        description: 'Trade updated successfully',
      });
      
    } catch (error: any) {
      console.error('Error updating trade:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trade',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
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

  const addHashtag = (hashtag: string) => {
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags([...allHashtags, hashtag]);
    }
  };
  
  const addSymbol = (symbol: Symbol) => {
    if (!symbols.some(s => s.symbol === symbol.symbol)) {
      const updatedSymbols = [...symbols, symbol];
      setSymbols(updatedSymbols);
      toast({
        title: "Symbol Added",
        description: `${symbol.name} has been added to your symbols list`,
      });
    }
  };

  const fetchTradingAccounts = async () => {
    if (!user) return;

    try {
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

  const createTradingAccount = async (name: string, balance: number) => {
    if (!user) throw new Error('User not authenticated');

    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الحساب",
        variant: "destructive"
      });
      throw new Error('Account name is required');
    }

    try {
      const newAccount = await userService.createTradingAccount(user.id, name, balance);
      
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
        description: "حدث خطأ أثناء إنشاء الحسا��",
        variant: "destructive"
      });
      throw error;
    }
  };

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
