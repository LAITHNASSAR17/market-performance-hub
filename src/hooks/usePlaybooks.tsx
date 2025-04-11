
import { useState } from 'react';

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  rating: number;
  tags: string[];
}

export const usePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<PlaybookEntry[]>([
    {
      id: '1',
      name: 'Pullback Retest',
      description: 'Trading the retracement from key levels after a strong move',
      rating: 4.5,
      tags: ['pullback', 'retracement', 'trend']
    },
    {
      id: '2',
      name: 'Breakout Setup',
      description: 'Trading the breakout from key resistance or support levels',
      rating: 4.0,
      tags: ['breakout', 'momentum', 'volume']
    }
  ]);
  
  return playbooks;
};
