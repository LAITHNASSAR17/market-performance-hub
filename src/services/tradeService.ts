
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

export async function getTradeById(id: string) {
  await connectToDatabase();
  return Trade.findById(id);
}

export async function getTradesByUserId(userId: string) {
  await connectToDatabase();
  return Trade.find({ userId });
}

export async function createTrade(tradeData: TradeData) {
  await connectToDatabase();
  const trade = new Trade(tradeData);
  return trade.save();
}

export async function updateTrade(id: string, tradeData: Partial<TradeData>) {
  await connectToDatabase();
  return Trade.findByIdAndUpdate(id, tradeData, { new: true });
}

export async function deleteTrade(id: string) {
  await connectToDatabase();
  return Trade.findByIdAndDelete(id);
}

export async function getAllTrades() {
  await connectToDatabase();
  return Trade.find({});
}
