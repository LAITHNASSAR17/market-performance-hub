
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
  rating: { type: Number, default: 0 },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  durationMinutes: { type: Number },
  playbook: { type: String },
  followedRules: [{ type: String }],
  marketSession: { type: String, enum: ['Asia', 'London', 'New York', 'London Close', 'Overlap', 'Other'] }
}, { timestamps: true });

export const Trade = mongoose.model('Trade', tradeSchema);
