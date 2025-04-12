
import Trade from '../models/Trade';
import { connectToDatabase } from '../lib/mongodb';

export async function getTradeById(id: string) {
  await connectToDatabase();
  return Trade.findById(id);
}

export async function getTradesByUserId(userId: string) {
  await connectToDatabase();
  return Trade.find({ userId });
}

export async function createTrade(tradeData: any) {
  await connectToDatabase();
  return Trade.create(tradeData);
}

export async function updateTrade(id: string, tradeData: any) {
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
