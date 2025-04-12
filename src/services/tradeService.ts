
import mongoose from 'mongoose';
import Trade from '../models/Trade';
import { connectToDatabase } from '../lib/mongodb';

// Define a proper interface for Trade data
interface TradeData {
  userId: mongoose.Types.ObjectId | string;
  account: string;
  date: Date;
  pair: string;
  type: 'Buy' | 'Sell';
  entry: number;
  exit: number;
  lotSize: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  riskPercentage: number;
  returnPercentage: number;
  profitLoss: number;
  durationMinutes: number;
  notes?: string;
  imageUrl?: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  hashtags?: string[];
  commission?: number;
  instrumentType?: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other';
  createdAt?: Date;
}

export async function getTradeById(id: string): Promise<TradeData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Trade.findById(id).lean();
}

export async function getTradesByUserId(userId: string): Promise<TradeData[]> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Trade.find({ userId }).lean();
}

export async function createTrade(tradeData: TradeData): Promise<TradeData> {
  await connectToDatabase();
  // Create a new document instance and save it
  const trade = new Trade(tradeData);
  return await trade.save();
}

export async function updateTrade(id: string, tradeData: Partial<TradeData>): Promise<TradeData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Trade.findByIdAndUpdate(
    id,
    tradeData,
    { new: true }
  ).lean();
}

export async function deleteTrade(id: string): Promise<TradeData | null> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Trade.findByIdAndDelete(id).lean();
}

export async function getAllTrades(): Promise<TradeData[]> {
  await connectToDatabase();
  // Use await directly on the method chain
  return await Trade.find({}).lean();
}
