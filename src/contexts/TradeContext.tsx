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
import { Trade } from '@/types/trade';
import { useToast } from '@/components/ui/use-toast';

type TradeContextType = {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; data: Trade | null; error: string | null }>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<{ success: boolean; data: Trade | null; error: string | null }>;
  deleteTrade: (id: string) => Promise<boolean>;
  getTrade: (id: string) => Promise<Trade | null>;
  findTradesByFilter: (filter: Partial<Trade>) => Promise<Trade[]>;
  loading: boolean;
  error: string | null;
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

// Mock data for testing purposes
const mockTradeData = [
  {
    id: "1",
    userId: "user123",
    symbol: "AAPL",
    entryPrice: 150.5,
    exitPrice: 155.75,
    quantity: 10,
    direction: "Buy",
    entryDate: new Date("2023-01-15T09:30:00"),
    exitDate: new Date("2023-01-15T14:45:00"),
    profitLoss: 52.5,
    fees: 2.99,
    notes: "Breakout strategy worked well",
    tags: ["breakout", "momentum"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
    rating: 4,
    stopLoss: 148.0,
    takeProfit: 157.0,
    durationMinutes: 315,
    riskPercentage: 1.5,
    returnPercentage: 3.5,
    pair: "AAPL/USD",
    imageUrl: "https://example.com/image1.png",
    beforeImageUrl: "https://example.com/before1.png",
    afterImageUrl: "https://example.com/after1.png",
    hashtags: ["#trading", "#stocks"]
  },
  {
    id: "2",
    userId: "user456",
    symbol: "GOOG",
    entryPrice: 2700.0,
    exitPrice: 2750.5,
    quantity: 5,
    direction: "Sell",
    entryDate: new Date("2023-02-01T11:00:00"),
    exitDate: new Date("2023-02-01T16:15:00"),
    profitLoss: -252.75,
    fees: 1.99,
    notes: "Failed to anticipate earnings report",
    tags: ["earnings", "correction"],
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
    rating: 2,
    stopLoss: 2720.0,
    takeProfit: 2650.0,
    durationMinutes: 315,
    riskPercentage: 2.0,
    returnPercentage: 1.0,
    pair: "GOOG/USD",
    imageUrl: "https://example.com/image2.png",
    beforeImageUrl: "https://example.com/before2.png",
    afterImageUrl: "https://example.com/after2.png",
    hashtags: ["#investing", "#tech"]
  },
  {
    id: "3",
    userId: "user789",
    symbol: "TSLA",
    entryPrice: 850.25,
    exitPrice: 840.50,
    quantity: 8,
    direction: "Buy",
    entryDate: new Date("2023-02-15T14:00:00"),
    exitDate: new Date("2023-02-15T19:30:00"),
    profitLoss: -78.0,
    fees: 3.49,
    notes: "Market volatility led to unexpected loss",
    tags: ["volatility", "electric vehicles"],
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-15"),
    rating: 3,
    stopLoss: 845.0,
    takeProfit: 860.0,
    durationMinutes: 330,
    riskPercentage: 1.0,
    returnPercentage: 2.5,
    pair: "TSLA/USD",
    imageUrl: "https://example.com/image3.png",
    beforeImageUrl: "https://example.com/before3.png",
    afterImageUrl: "https://example.com/after3.png",
    hashtags: ["#innovation", "#automotive"]
  },
  {
    id: "4",
    userId: "user101",
    symbol: "AMZN",
    entryPrice: 3200.75,
    exitPrice: 3250.0,
    quantity: 3,
    direction: "Sell",
    entryDate: new Date("2023-03-01T08:00:00"),
    exitDate: new Date("2023-03-01T13:45:00"),
    profitLoss: 147.75,
    fees: 2.49,
    notes: "E-commerce sector showing strong growth",
    tags: ["e-commerce", "growth"],
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-01"),
    rating: 5,
    stopLoss: 3220.0,
    takeProfit: 3150.0,
    durationMinutes: 345,
    riskPercentage: 1.8,
    returnPercentage: 4.0,
    pair: "AMZN/USD",
    imageUrl: "https://example.com/image4.png",
    beforeImageUrl: "https://example.com/before4.png",
    afterImageUrl: "https://example.com/after4.png",
    hashtags: ["#retail", "#online shopping"]
  },
  {
    id: "5",
    userId: "user202",
    symbol: "MSFT",
    entryPrice: 250.50,
    exitPrice: 255.0,
    quantity: 12,
    direction: "Buy",
    entryDate: new Date("2023-03-15T10:30:00"),
    exitDate: new Date("2023-03-15T16:00:00"),
    profitLoss: 53.5,
    fees: 1.49,
    notes: "Cloud computing driving stock value",
    tags: ["cloud computing", "technology"],
    createdAt: new Date("2023-03-15"),
    updatedAt: new Date("2023-03-15"),
    rating: 4,
    stopLoss: 248.0,
    takeProfit: 260.0,
    durationMinutes: 330,
    riskPercentage: 1.2,
    returnPercentage: 3.0,
    pair: "MSFT/USD",
    imageUrl: "https://example.com/image5.png",
    beforeImageUrl: "https://example.com/before5.png",
    afterImageUrl: "https://example.com/after5.png",
    hashtags: ["#software", "#business"]
  }
];

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      direction: apiTrade.direction,
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
      // Map any other fields as needed
    };
  };
  
  const convertToApiFormat = (trade: Partial<Trade>): Partial<ITrade> => {
    const apiTrade: Partial<ITrade> = {
      symbol: trade.symbol,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice,
      quantity: trade.quantity,
      direction: trade.direction,
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
        apiFilter[key] = value;
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
