
import * as yup from 'yup';

export interface TradeFormValues {
  pair: string;
  account: string;
  type: 'Buy' | 'Sell';
  date: Date;
  durationMinutes: number;
  entry: number;
  exit: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  lotSize: number;
  riskPercentage: number;
  profitLoss: number;
  returnPercentage: number;
  notes: string;
  hashtags: string[];
  imageUrl?: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  rating: number;
  commission: number;
  marketSession?: string;
  playbook?: string;
  followedRules?: string[];
}

// The schema needs to match the interface exactly
export const tradeSchema = yup.object({
  pair: yup.string().required('Trading pair is required'),
  account: yup.string().required('Account is required'),
  type: yup.string().oneOf(['Buy', 'Sell']).required('Trade type is required'),
  date: yup.date().required('Date is required'),
  durationMinutes: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
  entry: yup.number().required('Entry price is required'),
  exit: yup.number().required('Exit price is required'),
  stopLoss: yup.number().nullable().optional(),
  takeProfit: yup.number().nullable().optional(),
  lotSize: yup.number().required('Lot size is required').min(0.01, 'Lot size must be at least 0.01'),
  riskPercentage: yup.number().required('Risk percentage is required').min(0, 'Risk must be between 0 and 100').max(100, 'Risk must be between 0 and 100'),
  profitLoss: yup.number().required('Profit/Loss is required'),
  returnPercentage: yup.number().required('Return percentage is required'),
  notes: yup.string().optional(),
  hashtags: yup.array().of(yup.string()).default([]),
  imageUrl: yup.string().nullable().optional(),
  beforeImageUrl: yup.string().nullable().optional(),
  afterImageUrl: yup.string().nullable().optional(),
  rating: yup.number().required().default(0),
  commission: yup.number().required().default(0),
  marketSession: yup.string().optional(),
  playbook: yup.string().optional(),
  followedRules: yup.array().of(yup.string()).optional(),
}).required();
