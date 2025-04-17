
import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  quantity: { type: Number, required: true },
  direction: { type: String, enum: ['long', 'short'], required: true },
  entryDate: { type: Date, required: true },
  exitDate: { type: Date },
  profitLoss: { type: Number },
  fees: { type: Number, default: 0 },
  notes: { type: String },
  tags: [{ type: String }],
  isMultipleTrades: { type: Boolean, default: false },
  tradesCount: { type: Number, default: 1, min: 1, max: 30 },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  rating: { type: Number, min: 0, max: 5 },
  durationMinutes: { type: Number },
}, { timestamps: true });

export const Trade = mongoose.model('Trade', tradeSchema);
