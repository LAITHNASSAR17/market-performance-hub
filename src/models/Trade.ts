
import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  pair: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Buy', 'Sell'],
    required: true,
  },
  entry: {
    type: Number,
    required: true,
  },
  exit: {
    type: Number,
    required: true,
  },
  lotSize: {
    type: Number,
    required: true,
  },
  stopLoss: {
    type: Number,
    default: null,
  },
  takeProfit: {
    type: Number,
    default: null,
  },
  riskPercentage: {
    type: Number,
    required: true,
  },
  returnPercentage: {
    type: Number,
    required: true,
  },
  profitLoss: {
    type: Number,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: null,
  },
  beforeImageUrl: {
    type: String,
    default: null,
  },
  afterImageUrl: {
    type: String,
    default: null,
  },
  hashtags: {
    type: [String],
    default: [],
  },
  commission: {
    type: Number,
    default: 0,
  },
  instrumentType: {
    type: String,
    enum: ['forex', 'crypto', 'stock', 'index', 'commodity', 'other'],
    default: 'forex',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Trade || mongoose.model('Trade', TradeSchema);
