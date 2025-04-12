
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

// Define a document type that extends TradeData with MongoDB fields
type TradeDocument = TradeData & mongoose.Document;

export async function getTradeById(id: string): Promise<TradeDocument | null> {
  await connectToDatabase();
  return Trade.findById(id).lean().exec();
}

export async function getTradesByUserId(userId: string): Promise<TradeDocument[]> {
  await connectToDatabase();
  return Trade.find({ userId }).lean().exec();
}

export async function createTrade(tradeData: TradeData): Promise<TradeDocument> {
  await connectToDatabase();
  const trade = new Trade(tradeData);
  return trade.save();
}

export async function updateTrade(id: string, tradeData: Partial<TradeData>): Promise<TradeDocument | null> {
  await connectToDatabase();
  return Trade.findByIdAndUpdate(
    id,
    tradeData,
    { new: true }
  ).lean().exec();
}

export async function deleteTrade(id: string): Promise<TradeDocument | null> {
  await connectToDatabase();
  return Trade.findByIdAndDelete(id).lean().exec();
}

export async function getAllTrades(): Promise<TradeDocument[]> {
  await connectToDatabase();
  return Trade.find({}).lean().exec();
}
