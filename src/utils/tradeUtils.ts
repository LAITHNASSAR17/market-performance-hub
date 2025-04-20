
import { Trade } from '@/types/settings';

export const calculateProfitLoss = (trade: Partial<Trade>): number => {
  if (!trade.entry || !trade.exit || !trade.lotSize) return 0;
  const difference = trade.type === 'Buy' ? trade.exit - trade.entry : trade.entry - trade.exit;
  return difference * trade.lotSize;
};

export const calculateReturnPercentage = (trade: Partial<Trade>): number => {
  if (!trade.entry || !trade.exit) return 0;
  return ((trade.exit - trade.entry) / trade.entry) * 100;
};

export const calculateRiskPercentage = (trade: Partial<Trade>): number => {
  if (!trade.entry || !trade.stopLoss) return 0;
  return Math.abs((trade.stopLoss - trade.entry) / trade.entry) * 100;
};
