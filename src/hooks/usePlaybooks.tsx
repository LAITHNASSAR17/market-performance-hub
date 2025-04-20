import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ITrade } from '@/services/tradeService';
import { adaptTradeToITrade } from '@/utils/typeAdapters';

export interface PlaybookRule {
  id: string;
  type: 'entry' | 'exit' | 'risk' | 'custom';
  description: string;
}

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  rating: number;
  tags: string[];
  rMultiple?: number;
  winRate?: number;
  expectedValue?: number;
  profitFactor?: number;
  totalTrades?: number;
  averageProfit?: number;
  category?: 'trend' | 'reversal' | 'breakout' | 'other';
  isPrivate?: boolean;
  avgWinner?: number;
  avgLoser?: number;
  missedTrades?: number;
  netProfitLoss?: number;
  rules?: PlaybookRule[];
}

export const usePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<PlaybookEntry[]>([
    {
      id: '1',
      name: 'Pullback Retest',
      description: 'Trading the retracement from key levels after a strong move',
      rating: 4.5,
      tags: ['pullback', 'retracement', 'trend'],
      rMultiple: 2.8,
      winRate: 65,
      expectedValue: 1.52,
      profitFactor: 1.8,
      totalTrades: 28,
      averageProfit: 125.75,
      category: 'trend',
      isPrivate: false,
      avgWinner: 250.30,
      avgLoser: -75.20,
      missedTrades: 5,
      netProfitLoss: 3521.00,
      rules: [
        { id: '1-1', type: 'entry', description: 'Wait for pullback to key level' },
        { id: '1-2', type: 'entry', description: 'Confirm with price action' },
        { id: '1-3', type: 'exit', description: 'Take profit at previous swing high/low' },
        { id: '1-4', type: 'risk', description: 'Risk no more than 2% per trade' }
      ]
    },
    {
      id: '2',
      name: 'Breakout Setup',
      description: 'Trading the breakout from key resistance or support levels',
      rating: 4.0,
      tags: ['breakout', 'momentum', 'volume'],
      rMultiple: 2.1,
      winRate: 58,
      expectedValue: 1.02,
      profitFactor: 1.45,
      totalTrades: 35,
      averageProfit: 98.30,
      category: 'breakout',
      isPrivate: true,
      avgWinner: 210.50,
      avgLoser: -85.40,
      missedTrades: 8,
      netProfitLoss: 3440.50,
      rules: [
        { id: '2-1', type: 'entry', description: 'Wait for volume confirmation' },
        { id: '2-2', type: 'exit', description: 'Trailing stop after 1:1 R:R reached' },
        { id: '2-3', type: 'risk', description: 'Position size based on ATR' }
      ]
    },
    {
      id: '3',
      name: 'Gap and Go',
      description: 'Trading stocks that gap up or down at market open',
      rating: 3.8,
      tags: ['gap', 'opening range', 'momentum'],
      rMultiple: 2.5,
      winRate: 52,
      expectedValue: 0.98,
      profitFactor: 1.32,
      totalTrades: 22,
      averageProfit: 87.15,
      category: 'breakout',
      isPrivate: false,
      avgWinner: 190.30,
      avgLoser: -95.20,
      missedTrades: 3,
      netProfitLoss: 1917.30,
      rules: [
        { id: '3-1', type: 'entry', description: 'Enter after first 5-minute candle' },
        { id: '3-2', type: 'entry', description: 'Confirm direction with volume' },
        { id: '3-3', type: 'exit', description: 'Take profit at previous day high/low' }
      ]
    },
    {
      id: '4',
      name: 'Trend Continuation',
      description: 'Following established trends after brief consolidation',
      rating: 4.2,
      tags: ['trend', 'consolidation', 'momentum'],
      rMultiple: 3.2,
      winRate: 61,
      expectedValue: 1.73,
      profitFactor: 2.1,
      totalTrades: 31,
      averageProfit: 143.50,
      category: 'trend',
      isPrivate: false,
      avgWinner: 235.40,
      avgLoser: -69.80,
      missedTrades: 6,
      netProfitLoss: 4448.50,
      rules: [
        { id: '4-1', type: 'entry', description: 'Enter after consolidation breaks' },
        { id: '4-2', type: 'exit', description: 'Exit when momentum slows' },
        { id: '4-3', type: 'risk', description: 'Stop loss below recent swing low' }
      ]
    }
  ]);
  
  const addPlaybook = (playbook: Omit<PlaybookEntry, 'id'>) => {
    const newPlaybook = {
      ...playbook,
      id: Date.now().toString()
    };
    setPlaybooks([...playbooks, newPlaybook]);
  };
  
  const updatePlaybook = (id: string, updatedData: Partial<PlaybookEntry>) => {
    setPlaybooks(playbooks.map(p => p.id === id ? {...p, ...updatedData} : p));
  };
  
  const deletePlaybook = (id: string) => {
    setPlaybooks(playbooks.filter(p => p.id !== id));
  };

  const getPlaybookTrades = async (playbookId: string): Promise<ITrade[]> => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .contains('tags', [playbooks.find(p => p.id === playbookId)?.name]);
      
      if (error) throw error;
      
      return (data || []).map(trade => adaptTradeToITrade(trade));
    } catch (error) {
      console.error('Error fetching playbook trades:', error);
      return [];
    }
  };

  const calculatePlaybookMetrics = async (playbookId: string) => {
    try {
      const trades = await getPlaybookTrades(playbookId);
      if (trades.length === 0) return;

      const totalTrades = trades.length;
      const winningTrades = trades.filter(t => (t.profitLoss || 0) > 0);
      const losingTrades = trades.filter(t => (t.profitLoss || 0) <= 0);
      
      const winRate = (winningTrades.length / totalTrades) * 100;
      const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
      const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0));
      const profitFactor = totalLoss === 0 ? totalProfit : totalProfit / totalLoss;
      const netPL = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
      const avgProfit = netPL / totalTrades;
      const avgWinner = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
      const avgLoser = losingTrades.length > 0 ? totalLoss / losingTrades.length * -1 : 0;
      
      const expectancy = ((winRate / 100) * avgWinner) + ((1 - winRate / 100) * avgLoser);
      
      updatePlaybook(playbookId, {
        winRate: parseFloat(winRate.toFixed(2)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        totalTrades,
        averageProfit: parseFloat(avgProfit.toFixed(2)),
        expectedValue: parseFloat(expectancy.toFixed(2)),
        avgWinner: parseFloat(avgWinner.toFixed(2)),
        avgLoser: parseFloat(avgLoser.toFixed(2)),
        netProfitLoss: parseFloat(netPL.toFixed(2))
      });
      
    } catch (error) {
      console.error('Error calculating playbook metrics:', error);
    }
  };
  
  return {
    playbooks,
    addPlaybook,
    updatePlaybook,
    deletePlaybook,
    getPlaybookTrades,
    calculatePlaybookMetrics
  };
};
