
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
  expectancy: string;
  avgTradeLength: string;
  avgRiskReward: string;
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
    winLossRatio: '0.00',
    expectancy: '$0.00',
    avgTradeLength: '0 min',
    avgRiskReward: '0.00'
  });

  useEffect(() => {
    setStats(calculateStats(trades));
  }, [trades]);

  return stats;
};

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
      winLossRatio: '0.00',
      expectancy: '$0.00',
      avgTradeLength: '0 min',
      avgRiskReward: '0.00'
    };
  }
  
  const totalPL = trades.reduce((sum, trade) => sum + trade.total, 0);
  const winningTrades = trades.filter(trade => trade.total > 0);
  const losingTrades = trades.filter(trade => trade.total < 0);
  
  const winRate = (winningTrades.length / trades.length) * 100;
  
  const avgWin = winningTrades.length ? 
    winningTrades.reduce((sum, trade) => sum + trade.total, 0) / winningTrades.length : 
    0;
    
  const avgLoss = losingTrades.length ? 
    losingTrades.reduce((sum, trade) => sum + trade.total, 0) / losingTrades.length : 
    0;
    
  const largestWin = winningTrades.length ? 
    Math.max(...winningTrades.map(trade => trade.total)) : 
    0;
    
  const largestLoss = losingTrades.length ? 
    Math.min(...losingTrades.map(trade => trade.total)) : 
    0;
  
  // Calculate profit factor (ratio of gross profit to gross loss)
  const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.total, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.total, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (winningTrades.length > 0 ? "∞" : "0.00");
  
  // Calculate win/loss ratio
  const winLossRatio = losingTrades.length > 0 ? 
    (winningTrades.length / losingTrades.length).toFixed(2) : 
    (winningTrades.length > 0 ? "∞" : "0.00");

  // Calculate expectancy (average amount you can expect to win/lose per trade)
  const expectancy = (avgWin * (winRate / 100)) + (avgLoss * (1 - winRate / 100));

  // Calculate average trade duration
  const avgTradeLength = trades
    .filter(trade => trade.durationMinutes)
    .reduce((sum, trade) => sum + (trade.durationMinutes || 0), 0) / trades.length;

  // Calculate average risk/reward ratio
  const tradesWithRR = trades.filter(trade => trade.stopLoss && trade.takeProfit);
  const avgRiskReward = tradesWithRR.length ? 
    tradesWithRR.reduce((sum, trade) => {
      const risk = Math.abs(trade.entry - (trade.stopLoss || trade.entry));
      const reward = Math.abs(trade.entry - (trade.takeProfit || trade.entry));
      return sum + (reward / risk);
    }, 0) / tradesWithRR.length : 0;

  return {
    totalPL: `$${totalPL.toFixed(2)}`,
    winRate: `${winRate.toFixed(1)}%`,
    avgWin: `$${avgWin.toFixed(2)}`,
    avgLoss: `$${avgLoss.toFixed(2)}`,
    largestWin: `$${largestWin.toFixed(2)}`,
    largestLoss: `$${largestLoss.toFixed(2)}`,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    profitFactor,
    winLossRatio,
    expectancy: `$${expectancy.toFixed(2)}`,
    avgTradeLength: `${Math.round(avgTradeLength)} min`,
    avgRiskReward: avgRiskReward.toFixed(2)
  };
};
