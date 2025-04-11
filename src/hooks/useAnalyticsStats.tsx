
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
    losingTrades: 0
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
      losingTrades: 0
    };
  }
  
  const totalPL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = trades.filter(trade => trade.profitLoss > 0);
  const losingTrades = trades.filter(trade => trade.profitLoss < 0);
  
  const winRate = (winningTrades.length / trades.length) * 100;
  
  const avgWin = winningTrades.length ? 
    winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / winningTrades.length : 
    0;
    
  const avgLoss = losingTrades.length ? 
    losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / losingTrades.length : 
    0;
    
  const largestWin = winningTrades.length ? 
    Math.max(...winningTrades.map(trade => trade.profitLoss)) : 
    0;
    
  const largestLoss = losingTrades.length ? 
    Math.min(...losingTrades.map(trade => trade.profitLoss)) : 
    0;
  
  return {
    totalPL: `$${totalPL.toFixed(2)}`,
    winRate: `${winRate.toFixed(1)}%`,
    avgWin: `$${avgWin.toFixed(2)}`,
    avgLoss: `$${avgLoss.toFixed(2)}`,
    largestWin: `$${largestWin.toFixed(2)}`,
    largestLoss: `$${largestLoss.toFixed(2)}`,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length
  };
};
