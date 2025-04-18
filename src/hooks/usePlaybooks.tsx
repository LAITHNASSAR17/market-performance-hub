
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ITrade } from '@/services/tradeService';

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
      category: 'trend'
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
      category: 'breakout'
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
      category: 'breakout'
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
      category: 'trend'
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

  // Get trades linked to a specific playbook
  const getPlaybookTrades = async (playbookId: string): Promise<ITrade[]> => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .contains('tags', [playbooks.find(p => p.id === playbookId)?.name]);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching playbook trades:', error);
      return [];
    }
  };
  
  return {
    playbooks,
    addPlaybook,
    updatePlaybook,
    deletePlaybook,
    getPlaybookTrades
  };
};
