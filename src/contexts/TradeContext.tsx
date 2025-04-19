
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { ITrade, tradeService } from '@/services/tradeService';
import { Trade as TradeType } from '@/types/trade';
import { useToast } from '@/components/ui/use-toast';

// Export Trade type for use in other components
export type Trade = TradeType;

// Define a TradingAccount type
export interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  balance: number;
  created_at?: string;
}

// Define a Symbol type
export interface Symbol {
  symbol: string;
  name: string;
  type: 'forex' | 'stock' | 'crypto' | 'other';
}

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; data: Trade | null; error: string | null }>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<{ success: boolean; data: Trade | null; error: string | null }>;
  deleteTrade: (id: string) => Promise<boolean>;
  getTrade: (id: string) => Promise<Trade | null>;
  findTradesByFilter: (filter: Partial<Trade>) => Promise<Trade[]>;
  loading: boolean;
  error: string | null;
  // Additional properties for components
  tradingAccounts: TradingAccount[];
  accounts: string[];
  pairs: string[];
  symbols: Symbol[];
  allHashtags: string[];
  addHashtag: (hashtag: string) => void;
  addSymbol: (symbol: Symbol) => void;
  getAllTrades?: () => Promise<Trade[]>;
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

// Mock trading accounts
const mockTradingAccounts: TradingAccount[] = [
  { id: "1", name: "Main Trading", balance: 10000, userId: "user123" },
  { id: "2", name: "Retirement", balance: 50000, userId: "user123" },
  { id: "3", name: "Forex", balance: 5000, userId: "user123" },
];

// Mock symbols
const mockSymbols: Symbol[] = [
  { symbol: "EURUSD", name: "EUR/USD", type: "forex" },
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
  { symbol: "BTCUSD", name: "Bitcoin/USD", type: "crypto" },
];

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>(mockTradingAccounts);
  const [symbols, setSymbols] = useState<Symbol[]>(mockSymbols);
  const [allHashtags, setAllHashtags] = useState<string[]>([
    "#forex", "#stocks", "#crypto", "#trading", "#winning", "#losing"
  ]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch trades from the database
        const allTrades = await tradeService.getAllTrades();
        
        // Convert the trades to the correct format
        const formattedTrades = allTrades.map(convertFromApiFormat);
        
        // Filter trades by user ID
        const userTrades = formattedTrades.filter(trade => trade.userId === user?.id);
        
        setTrades(userTrades);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trades');
        toast({
          title: "Error",
          description: "Failed to fetch trades",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrades();
    } else {
      setTrades([]);
    }
  }, [user, toast]);
  
  const convertFromApiFormat = (apiTrade: ITrade): Trade => {
    return {
      id: apiTrade.id,
      userId: apiTrade.user_id,
      symbol: apiTrade.symbol,
      entryPrice: apiTrade.entry_price,
      exitPrice: apiTrade.exit_price || 0,
      quantity: apiTrade.quantity,
      direction: apiTrade.direction as 'long' | 'short', // Ensure correct type
      entryDate: new Date(apiTrade.entry_date),
      exitDate: apiTrade.exit_date ? new Date(apiTrade.exit_date) : null,
      profitLoss: apiTrade.profit_loss,
      fees: apiTrade.fees || 0,
      notes: apiTrade.notes || "",
      tags: apiTrade.tags || [],
      createdAt: new Date(apiTrade.created_at),
      updatedAt: new Date(apiTrade.updated_at),
      rating: apiTrade.rating || 0,
      stopLoss: apiTrade.stop_loss || 0,
      takeProfit: apiTrade.take_profit || 0,
      durationMinutes: apiTrade.duration_minutes || 0,
      playbook: apiTrade.playbook,
      followedRules: apiTrade.followed_rules,
      marketSession: apiTrade.market_session,
      accountId: apiTrade.account_id,
      riskPercentage: apiTrade.risk_percentage || 0,
      returnPercentage: apiTrade.return_percentage || 0,
      // Compatibility fields
      date: apiTrade.entry_date.substring(0, 10),
      pair: apiTrade.symbol,
      type: apiTrade.direction === 'long' ? 'Buy' as const : 'Sell' as const,
      entry: apiTrade.entry_price,
      exit: apiTrade.exit_price || 0,
      account: apiTrade.account_id || "Main Trading",
      lotSize: apiTrade.quantity,
      hashtags: apiTrade.tags || [],
      commission: apiTrade.fees || 0,
      imageUrl: apiTrade.image_url,
      beforeImageUrl: apiTrade.before_image_url,
      afterImageUrl: apiTrade.after_image_url
    };
  };
  
  const convertToApiFormat = (trade: Partial<Trade>): Partial<ITrade> => {
    const apiTrade: Partial<ITrade> = {
      symbol: trade.symbol,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice,
      quantity: trade.quantity,
      direction: trade.direction as 'long' | 'short',
      entry_date: trade.entryDate instanceof Date ? trade.entryDate.toISOString() : undefined,
      exit_date: trade.exitDate instanceof Date ? trade.exitDate.toISOString() : null,
      profit_loss: trade.profitLoss,
      fees: trade.fees,
      notes: trade.notes,
      tags: trade.tags,
      rating: trade.rating,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      duration_minutes: trade.durationMinutes,
      playbook: trade.playbook,
      followed_rules: trade.followedRules,
      market_session: trade.marketSession,
      account_id: trade.accountId,
      risk_percentage: trade.riskPercentage,
      return_percentage: trade.returnPercentage,
      user_id: trade.userId,
      image_url: trade.imageUrl,
      before_image_url: trade.beforeImageUrl,
      after_image_url: trade.afterImageUrl
    };
    
    return apiTrade;
  };

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Add the user ID from the auth context
      const userId = user?.id || "";
      
      // Convert to API format
      const apiTradeData = {
        ...convertToApiFormat(tradeData),
        user_id: userId,
      };
      
      // Call the tradeService
      const { data, error } = await tradeService.createTrade(apiTradeData as Omit<ITrade, 'id' | 'created_at' | 'updated_at'>);
      
      if (error) throw new Error(error.message);
      
      // Convert back to our format if successful
      if (data) {
        const newTrade = convertFromApiFormat(data);
        setTrades(prevTrades => [newTrade, ...prevTrades]);
        return { success: true, data: newTrade, error: null };
      }
      
      return { success: false, data: null, error: "Failed to create trade" };
    } catch (error: any) {
      console.error("Error creating trade:", error);
      return { success: false, data: null, error: error.message };
    }
  };

  const updateTrade = useCallback(async (id: string, tradeData: Partial<Trade>) => {
    try {
      // Convert to API format
      const apiTradeData = convertToApiFormat(tradeData);
      
      // Call the tradeService
      const { data, error } = await tradeService.updateTrade(id, apiTradeData);
      
      if (error) throw new Error(error.message);
      
      // Convert back to our format if successful
      if (data) {
        const updatedTrade = convertFromApiFormat(data);
        setTrades(prevTrades =>
          prevTrades.map(trade => (trade.id === id ? updatedTrade : trade))
        );
        return { success: true, data: updatedTrade, error: null };
      }
      
      return { success: false, data: null, error: "Failed to update trade" };
    } catch (error: any) {
      console.error("Error updating trade:", error);
      return { success: false, data: null, error: error.message };
    }
  }, []);

  const deleteTrade = useCallback(async (id: string) => {
    try {
      const { error } = await tradeService.deleteTrade(id);
      if (error) {
        console.error('Error deleting trade:', error);
        toast({
          title: "Error",
          description: "Failed to delete trade",
          variant: "destructive",
        });
        return false;
      }

      setTrades(prevTrades => prevTrades.filter(trade => trade.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        title: "Error",
        description: "Failed to delete trade",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const getTrade = useCallback(async (id: string) => {
    try {
      const trade = await tradeService.getTradeById(id);
      return trade ? convertFromApiFormat(trade) : null;
    } catch (error) {
      console.error('Error fetching trade:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trade",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const findTradesByFilter = useCallback(async (filter: Partial<Trade>) => {
    try {
      // Convert filter to API format
      const apiFilter: any = {};
      Object.entries(filter).forEach(([key, value]) => {
        // Map from our property names to API property names
        const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        apiFilter[apiKey] = value;
      });
      
      const trades = await tradeService.findTradesByFilter(apiFilter);
      return trades ? trades.map(convertFromApiFormat) : [];
    } catch (error) {
      console.error('Error finding trades by filter:', error);
      toast({
        title: "Error",
        description: "Failed to find trades by filter",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const getAllTrades = useCallback(async () => {
    try {
      const allTrades = await tradeService.getAllTrades();
      return allTrades.map(convertFromApiFormat);
    } catch (error) {
      console.error('Error fetching all trades:', error);
      return [];
    }
  }, []);

  const addHashtag = useCallback((hashtag: string) => {
    if (!hashtag.startsWith('#')) {
      hashtag = `#${hashtag}`;
    }
    
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags(prev => [...prev, hashtag]);
    }
  }, [allHashtags]);

  const addSymbol = useCallback((symbol: Symbol) => {
    if (!symbols.some(s => s.symbol === symbol.symbol)) {
      setSymbols(prev => [...prev, symbol]);
    }
  }, [symbols]);

  // Create a list of account names for dropdowns
  const accounts = tradingAccounts.map(account => account.name);
  
  // Create a list of pairs for dropdowns
  const pairs = symbols.map(symbol => symbol.symbol);

  return (
    <TradeContext.Provider
      value={{
        trades,
        addTrade,
        updateTrade,
        deleteTrade,
        getTrade,
        findTradesByFilter,
        loading,
        error,
        tradingAccounts,
        accounts,
        pairs,
        symbols,
        allHashtags,
        addHashtag,
        addSymbol,
        getAllTrades
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};
