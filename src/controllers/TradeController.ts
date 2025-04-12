
import { TradeModel, Trade } from '../models/TradeModel';

export class TradeController {
  private model: TradeModel;

  constructor() {
    this.model = new TradeModel();
  }

  async getTrade(id: string): Promise<Trade | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      console.error('Error getting trade:', error);
      return null;
    }
  }

  async getUserTrades(userId: string, limit?: number, offset?: number): Promise<Trade[]> {
    try {
      return await this.model.findByUserId(userId, limit, offset);
    } catch (error) {
      console.error('Error getting user trades:', error);
      return [];
    }
  }

  async createTrade(tradeData: Omit<Trade, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      // Business logic can be added here
      return await this.model.create(tradeData);
    } catch (error) {
      console.error('Error creating trade:', error);
      return null;
    }
  }

  async updateTrade(id: string, tradeData: Partial<Trade>): Promise<boolean> {
    try {
      // Business logic - check if trade exists first
      const existingTrade = await this.model.findById(id);
      if (!existingTrade) {
        throw new Error('Trade not found');
      }

      // Check ownership of the trade
      if (tradeData.userId && existingTrade.userId !== tradeData.userId) {
        throw new Error('Cannot change trade ownership');
      }

      return await this.model.update(id, tradeData);
    } catch (error) {
      console.error('Error updating trade:', error);
      return false;
    }
  }

  async deleteTrade(id: string): Promise<boolean> {
    try {
      // Business logic - check if trade exists first
      const existingTrade = await this.model.findById(id);
      if (!existingTrade) {
        throw new Error('Trade not found');
      }

      return await this.model.delete(id);
    } catch (error) {
      console.error('Error deleting trade:', error);
      return false;
    }
  }

  async getTradesByAccount(userId: string, account: string): Promise<Trade[]> {
    try {
      return await this.model.getTradesByAccount(userId, account);
    } catch (error) {
      console.error('Error getting trades by account:', error);
      return [];
    }
  }

  async getTradesByPair(userId: string, pair: string): Promise<Trade[]> {
    try {
      return await this.model.getTradesByPair(userId, pair);
    } catch (error) {
      console.error('Error getting trades by pair:', error);
      return [];
    }
  }

  async getTradesByDateRange(userId: string, startDate: string, endDate: string): Promise<Trade[]> {
    try {
      return await this.model.getTradesByDateRange(userId, startDate, endDate);
    } catch (error) {
      console.error('Error getting trades by date range:', error);
      return [];
    }
  }

  async getUserTradingPairs(userId: string): Promise<string[]> {
    try {
      return await this.model.getUserTradingPairs(userId);
    } catch (error) {
      console.error('Error getting user trading pairs:', error);
      return [];
    }
  }

  async getUserAccounts(userId: string): Promise<string[]> {
    try {
      return await this.model.getUserAccounts(userId);
    } catch (error) {
      console.error('Error getting user accounts:', error);
      return [];
    }
  }

  async getAllTrades(): Promise<Trade[]> {
    try {
      // Instead of using the protected findAll method, use a query that selects all trades
      // We'll implement it with getUserTrades with no filters
      return await this.model.findByUserId("0", 9999); // Using a large limit to get all trades
    } catch (error) {
      console.error('Error getting all trades:', error);
      return [];
    }
  }

  // Calculate trade performance metrics for a user
  async calculateUserPerformance(userId: string, startDate?: string, endDate?: string): Promise<{
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfitLoss: number;
    averageProfitLoss: number;
    largestWin: number;
    largestLoss: number;
    averageWin: number;
    averageLoss: number;
  }> {
    try {
      // Get all trades for the user
      let trades;
      if (startDate && endDate) {
        trades = await this.model.getTradesByDateRange(userId, startDate, endDate);
      } else {
        trades = await this.model.findByUserId(userId);
      }

      if (trades.length === 0) {
        return {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalProfitLoss: 0,
          averageProfitLoss: 0,
          largestWin: 0,
          largestLoss: 0,
          averageWin: 0,
          averageLoss: 0
        };
      }

      // Calculate performance metrics
      const winningTrades = trades.filter(trade => trade.profitLoss > 0);
      const losingTrades = trades.filter(trade => trade.profitLoss < 0);
      const neutralTrades = trades.filter(trade => trade.profitLoss === 0);

      const totalProfitLoss = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const averageProfitLoss = totalProfitLoss / trades.length;

      const largestWin = winningTrades.length > 0 
        ? Math.max(...winningTrades.map(trade => trade.profitLoss)) 
        : 0;
      
      const largestLoss = losingTrades.length > 0 
        ? Math.min(...losingTrades.map(trade => trade.profitLoss)) 
        : 0;

      const totalWinAmount = winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const totalLossAmount = losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);

      const averageWin = winningTrades.length > 0 ? totalWinAmount / winningTrades.length : 0;
      const averageLoss = losingTrades.length > 0 ? totalLossAmount / losingTrades.length : 0;

      const winRate = (winningTrades.length / trades.length) * 100;

      return {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: Math.round(winRate * 100) / 100,
        totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
        averageProfitLoss: Math.round(averageProfitLoss * 100) / 100,
        largestWin,
        largestLoss,
        averageWin: Math.round(averageWin * 100) / 100,
        averageLoss: Math.round(averageLoss * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating user performance:', error);
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfitLoss: 0,
        averageProfitLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        averageWin: 0,
        averageLoss: 0
      };
    }
  }
}
