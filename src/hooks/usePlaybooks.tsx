
import { useState } from 'react';

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  rating: number;
  tags: string[];
  rMultiple?: number;
  winRate?: number;
  expectedValue?: number;
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
      expectedValue: 1.52
    },
    {
      id: '2',
      name: 'Breakout Setup',
      description: 'Trading the breakout from key resistance or support levels',
      rating: 4.0,
      tags: ['breakout', 'momentum', 'volume'],
      rMultiple: 2.1,
      winRate: 58,
      expectedValue: 1.02
    },
    {
      id: '3',
      name: 'Gap and Go',
      description: 'Trading stocks that gap up or down at market open',
      rating: 3.8,
      tags: ['gap', 'opening range', 'momentum'],
      rMultiple: 2.5,
      winRate: 52,
      expectedValue: 0.98
    },
    {
      id: '4',
      name: 'Trend Continuation',
      description: 'Following established trends after brief consolidation',
      rating: 4.2,
      tags: ['trend', 'consolidation', 'momentum'],
      rMultiple: 3.2,
      winRate: 61,
      expectedValue: 1.73
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
  
  return {
    playbooks,
    addPlaybook,
    updatePlaybook,
    deletePlaybook
  };
};
