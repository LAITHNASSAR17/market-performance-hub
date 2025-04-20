
import { useState, useEffect } from 'react';
import { useTrade } from '@/contexts/TradeContext';

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
  allTimeStats: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    breakEvenTrades: number;
  };
  monthlyStats: {
    totalTrades: number;
    profit: number;
  };
  weeklyStats: {
    totalTrades: number;
    profit: number;
  };
}

export const useAnalyticsStats = () => {
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
    avgRiskReward: '0.00',
    allTimeStats: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0
    },
    monthlyStats: {
      totalTrades: 0,
      profit: 0
    },
    weeklyStats: {
      totalTrades: 0,
      profit: 0
    }
  });

  useEffect(() => {
    if (!trades.length) return;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.setDate(now.getDate() - 7));

    // Calculate monthly stats
    const monthlyTrades = trades.filter(trade => new Date(trade.createdAt) >= monthStart);
    const monthlyProfit = monthlyTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);

    // Calculate weekly stats
    const weeklyTrades = trades.filter(trade => new Date(trade.createdAt) >= weekStart);
    const weeklyProfit = weeklyTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);

    // Calculate all time stats
    const winningTrades = trades.filter(trade => trade.profitLoss > 0);
    const losingTrades = trades.filter(trade => trade.profitLoss < 0);
    const breakEvenTrades = trades.filter(trade => trade.profitLoss === 0);

    setStats(prevStats => ({
      ...prevStats,
      allTimeStats: {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        breakEvenTrades: breakEvenTrades.length
      },
      monthlyStats: {
        totalTrades: monthlyTrades.length,
        profit: monthlyProfit
      },
      weeklyStats: {
        totalTrades: weeklyTrades.length,
        profit: weeklyProfit
      }
    }));
  }, [trades]);

  return stats;
};
