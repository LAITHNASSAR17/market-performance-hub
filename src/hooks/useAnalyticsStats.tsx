
import { useState, useEffect } from 'react';
import { useTrade, Trade } from '@/contexts/TradeContext';

export interface TradeStats {
  totalPL: string;
  winRate: string;
  avgWin: string;
  avgLoss: string;
  largestWin: string;
  largestLoss: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitFactor: string;
  winLossRatio: string;
}

export const useAnalyticsStats = (): TradeStats => {
  const { trades } = useTrade();
  const [stats, setStats] = useState<TradeStats>({
    totalPL: '$0.00',
    winRate: '0%',
    avgWin: '$0.00',
    avgLoss: '$0.00',
    largestWin: '$0.00',
    largestLoss: '$0.00',
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    profitFactor: '0.00',
    winLossRatio: '0.00'
  });

  useEffect(() => {
    setStats(calculateStats(trades));
  }, [trades]);

  return stats;
};

// Calculate stats from trades
const calculateStats = (trades: Trade[]): TradeStats => {
  if (!trades.length) {
    return {
      totalPL: '$0.00',
      winRate: '0%',
      avgWin: '$0.00',
      avgLoss: '$0.00',
      largestWin: '$0.00',
      largestLoss: '$0.00',
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      profitFactor: '0.00',
      winLossRatio: '0.00'
    };
  }
  
  // تعديل لحساب عدد الصفقات الإجمالي مع مراعاة تعدد الصفقات
  const actualTradesCount = trades.reduce((count, trade) => {
    // إذا كانت الصفقة متعددة، استخدم عدد الصفقات المحدد، وإلا استخدم 1
    const tradeCount = trade.isMultipleTrades && trade.tradesCount ? trade.tradesCount : 1;
    return count + tradeCount;
  }, 0);
  
  const totalPL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  
  // تعديل لحساب الصفقات الرابحة والخاسرة مع مراعاة تعدد الصفقات
  const winningTradesData = trades.filter(trade => trade.profitLoss > 0);
  const winningTradesCount = winningTradesData.reduce((count, trade) => {
    const tradeCount = trade.isMultipleTrades && trade.tradesCount ? trade.tradesCount : 1;
    return count + tradeCount;
  }, 0);
  
  const losingTradesData = trades.filter(trade => trade.profitLoss < 0);
  const losingTradesCount = losingTradesData.reduce((count, trade) => {
    const tradeCount = trade.isMultipleTrades && trade.tradesCount ? trade.tradesCount : 1;
    return count + tradeCount;
  }, 0);
  
  // حساب نسبة الربح باستخدام العدد الفعلي للصفقات
  const winRate = (winningTradesCount / actualTradesCount) * 100;
  
  const avgWin = winningTradesData.length ? 
    winningTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0) / winningTradesData.length : 
    0;
    
  const avgLoss = losingTradesData.length ? 
    losingTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0) / losingTradesData.length : 
    0;
    
  const largestWin = winningTradesData.length ? 
    Math.max(...winningTradesData.map(trade => trade.profitLoss)) : 
    0;
    
  const largestLoss = losingTradesData.length ? 
    Math.min(...losingTradesData.map(trade => trade.profitLoss)) : 
    0;
  
  // Calculate profit factor (ratio of gross profit to gross loss)
  const grossProfit = winningTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const grossLoss = Math.abs(losingTradesData.reduce((sum, trade) => sum + trade.profitLoss, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (winningTradesData.length > 0 ? "∞" : "0.00");
  
  // Calculate win/loss ratio using actual counts
  const winLossRatio = losingTradesCount > 0 ? 
    (winningTradesCount / losingTradesCount).toFixed(2) : 
    (winningTradesCount > 0 ? "∞" : "0.00");
  
  return {
    totalPL: `$${totalPL.toFixed(2)}`,
    winRate: `${winRate.toFixed(1)}%`,
    avgWin: `$${avgWin.toFixed(2)}`,
    avgLoss: `$${avgLoss.toFixed(2)}`,
    largestWin: `$${largestWin.toFixed(2)}`,
    largestLoss: `$${largestLoss.toFixed(2)}`,
    totalTrades: actualTradesCount,
    winningTrades: winningTradesCount,
    losingTrades: losingTradesCount,
    profitFactor,
    winLossRatio
  };
};
