
import { useState, useEffect } from 'react';
import { useTrade, Trade } from '@/contexts/TradeContext';

export interface IPlaybook {
  id: string;
  name: string;
  description: string;
  winRate: number;
  rMultiple: string;
  expectedValue: string;
  rating: number;
  tags: string[];
  isPrivate?: boolean;
  category?: string;
  netProfitLoss?: number;
  totalTrades?: number;
}

export interface PlaybookEntry {
  id: string;
  name: string;
  entryConditions: string[];
  exitConditions: string[];
}

export interface PlaybookRule {
  id: string;
  description: string;
  isRequired: boolean;
}

export interface ITrade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  direction: string;
  entryDate: Date;
  exitDate: Date | null;
  profitLoss: number;
  fees: number;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  stopLoss: number;
  takeProfit: number;
  durationMinutes: number;
  playbook?: string;
  followedRules?: string[];
  marketSession?: string;
}

export const usePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<IPlaybook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<IPlaybook | null>(null);
  const { trades } = useTrade();

  useEffect(() => {
    // Mock playbooks data with enhanced properties
    const mockPlaybooks: IPlaybook[] = [
      {
        id: "1",
        name: "Trend Following",
        description: "Enter long positions when price breaks above a moving average in an uptrend.",
        winRate: 60,
        rMultiple: "2.0",
        expectedValue: "1.2",
        rating: 4,
        tags: ["trend", "momentum", "moving average"],
        isPrivate: false,
        category: "Momentum",
        netProfitLoss: 1250,
        totalTrades: 35
      },
      {
        id: "2",
        name: "Range Breakout",
        description: "Trade breakouts from defined trading ranges after consolidation.",
        winRate: 55,
        rMultiple: "2.5",
        expectedValue: "1.4",
        rating: 3,
        tags: ["range", "breakout", "consolidation"],
        isPrivate: true,
        category: "Breakout",
        netProfitLoss: 980,
        totalTrades: 28
      },
      {
        id: "3",
        name: "Fibonacci Retracement",
        description: "Enter positions on key Fibonacci retracement levels in established trends.",
        winRate: 65,
        rMultiple: "1.8",
        expectedValue: "1.2",
        rating: 5,
        tags: ["fibonacci", "retracement", "trend"],
        isPrivate: false,
        category: "Technical",
        netProfitLoss: 1750,
        totalTrades: 42
      }
    ];

    setPlaybooks(mockPlaybooks);
  }, []);

  const tradesForPlaybook = trades.filter(trade => 
    trade.playbook === selectedPlaybook?.name
  ).map(trade => {
    // Map the Trade object to ITrade correctly
    return {
      id: trade.id,
      userId: trade.userId,
      symbol: trade.symbol || trade.pair || '',
      entryPrice: trade.entryPrice || trade.entry || 0,
      exitPrice: trade.exitPrice || trade.exit || 0,
      quantity: trade.quantity || trade.lotSize || 0,
      direction: trade.direction || (trade.type === 'Buy' ? 'long' : 'short'),
      entryDate: trade.entryDate || new Date(trade.date || ''),
      exitDate: trade.exitDate || null,
      profitLoss: trade.profitLoss,
      fees: trade.fees,
      notes: trade.notes,
      tags: trade.tags || trade.hashtags || [],
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
      rating: trade.rating || 0,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      durationMinutes: trade.durationMinutes,
      playbook: trade.playbook,
      followedRules: trade.followedRules || [],
      marketSession: trade.marketSession
    };
  });

  // Add playbook management functions
  const addPlaybook = (playbook: Omit<IPlaybook, 'id'>) => {
    const newPlaybook = {
      ...playbook,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPlaybooks([...playbooks, newPlaybook]);
  };

  const updatePlaybook = (id: string, updatedPlaybook: Partial<IPlaybook>) => {
    const updated = playbooks.map(p => 
      p.id === id ? { ...p, ...updatedPlaybook } : p
    );
    setPlaybooks(updated);
  };

  const deletePlaybook = (id: string) => {
    setPlaybooks(playbooks.filter(p => p.id !== id));
    if (selectedPlaybook?.id === id) {
      setSelectedPlaybook(null);
    }
  };

  return {
    playbooks,
    selectedPlaybook,
    setSelectedPlaybook,
    tradesForPlaybook,
    addPlaybook,
    updatePlaybook,
    deletePlaybook
  };
};
