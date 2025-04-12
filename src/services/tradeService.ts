
import Trade from '../models/Trade';
import { connectToDatabase } from '../lib/mongodb';

export async function getTradeById(id: string) {
  await connectToDatabase();
  return Trade.findById(id).exec();
}

export async function getTradesByUserId(userId: string) {
  await connectToDatabase();
  return Trade.find({ userId }).exec();
}

export async function createTrade(tradeData: any) {
  await connectToDatabase();
  return Trade.create(tradeData);
}

export async function updateTrade(id: string, tradeData: any) {
  await connectToDatabase();
  return Trade.findByIdAndUpdate(id, tradeData, { new: true }).exec();
}

export async function deleteTrade(id: string) {
  await connectToDatabase();
  return Trade.findByIdAndDelete(id).exec();
}

export async function getAllTrades() {
  await connectToDatabase();
  return Trade.find({}).exec();
}
