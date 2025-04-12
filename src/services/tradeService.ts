
import { Trade } from '../models/Trade';

export interface ITrade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  direction: 'long' | 'short';
  entryDate: Date;
  exitDate: Date;
  profitLoss: number;
  fees: number;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const tradeService = {
  async getTradeById(id: string): Promise<ITrade | null> {
    return await Trade.findById(id).exec();
  },

  async getAllTrades(): Promise<ITrade[]> {
    return await Trade.find().exec();
  },

  async createTrade(tradeData: Omit<ITrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITrade> {
    const trade = new Trade(tradeData);
    return await trade.save();
  },

  async updateTrade(id: string, tradeData: Partial<ITrade>): Promise<ITrade | null> {
    return await Trade.findByIdAndUpdate(id, tradeData, { new: true }).exec();
  },

  async deleteTrade(id: string): Promise<boolean> {
    const result = await Trade.findByIdAndDelete(id).exec();
    return !!result;
  },

  async findTradesByFilter(filter: Partial<ITrade>): Promise<ITrade[]> {
    return await Trade.find(filter).exec();
  }
};
