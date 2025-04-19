
import { useState, useEffect } from 'react';
import { useTrade, Trade } from '@/contexts/TradeContext';

export interface IPlaybook {
  id: string;
  name: string;
  description: string;
  winRate: number;
  rMultiple: number; // Changed from string | number to number
  expectedValue: number; // Changed from string | number to number
  rating: number;
  tags: string[];
  isPrivate?: boolean;
  category?: string;
  netProfitLoss?: number;
  totalTrades?: number;
  rules?: PlaybookRule[]; // Changed from string[] to PlaybookRule[]
  success_criteria?: string[];
  avgWinner?: number;
  avgLoser?: number;
  profitFactor?: number; // Changed from string to number
  missedTrades?: number;
}

export interface PlaybookEntry extends IPlaybook {
  entryConditions: string[];
  exitConditions: string[];
}

export interface PlaybookRule {
  id: string;
  description: string;
  isRequired: boolean;
  type?: string;
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
        rMultiple: 2.0,
        expectedValue: 1.2,
        rating: 4,
        tags: ["trend", "momentum", "moving average"],
        isPrivate: false,
        category: "Momentum",
        netProfitLoss: 1250,
        totalTrades: 35,
        profitFactor: 1.8, // Changed from string to number
        avgWinner: 120,
        avgLoser: -67,
        rules: [
          { id: "tf1", description: "Follow the trend", isRequired: true, type: "entry" },
          { id: "tf2", description: "Wait for pullback", isRequired: true, type: "entry" },
          { id: "tf3", description: "Confirm with volume", isRequired: false, type: "entry" }
        ],
        success_criteria: ["Trend continues", "2:1 reward to risk ratio"]
      },
      {
        id: "2",
        name: "Range Breakout",
        description: "Trade breakouts from defined trading ranges after consolidation.",
        winRate: 55,
        rMultiple: 2.5,
        expectedValue: 1.4,
        rating: 3,
        tags: ["range", "breakout", "consolidation"],
        isPrivate: true,
        category: "Breakout",
        netProfitLoss: 980,
        totalTrades: 28,
        profitFactor: 1.5, // Changed from string to number
        avgWinner: 140,
        avgLoser: -72,
        rules: [
          { id: "rb1", description: "Identify clear range", isRequired: true, type: "entry" },
          { id: "rb2", description: "Wait for volume confirmation", isRequired: true, type: "entry" },
          { id: "rb3", description: "Avoid trading into news", isRequired: false, type: "risk" }
        ],
        success_criteria: ["Price makes new high/low", "Volume increases on breakout"]
      },
      {
        id: "3",
        name: "Fibonacci Retracement",
        description: "Enter positions on key Fibonacci retracement levels in established trends.",
        winRate: 65,
        rMultiple: 1.8,
        expectedValue: 1.2,
        rating: 5,
        tags: ["fibonacci", "retracement", "trend"],
        isPrivate: false,
        category: "Technical",
        netProfitLoss: 1750,
        totalTrades: 42,
        profitFactor: 2.0, // Changed from string to number
        avgWinner: 110,
        avgLoser: -60,
        rules: [
          { id: "fib1", description: "Draw Fibonacci levels on major moves", isRequired: true, type: "entry" },
          { id: "fib2", description: "Wait for price to respect level", isRequired: true, type: "entry" },
          { id: "fib3", description: "Look for confluence with other indicators", isRequired: false, type: "entry" }
        ],
        success_criteria: ["Price bounces from key level", "Trend continuation"]
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
