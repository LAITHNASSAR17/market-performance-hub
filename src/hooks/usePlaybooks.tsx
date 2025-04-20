
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PlaybookEntry } from '@/types/settings';

export const usePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<PlaybookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaybooks = async () => {
    setIsLoading(true);
    try {
      // Since playbooks table doesn't exist in the database
      // We'll provide mock data instead of querying a non-existent table
      
      // Mock data for development
      const mockPlaybooks: PlaybookEntry[] = [
        {
          id: '1',
          name: 'Trend Following Strategy',
          description: 'A strategy focused on capturing large market moves',
          rules: [
            { id: '1-1', description: 'Only enter in direction of main trend', type: 'entry', order: 1 },
            { id: '1-2', description: 'Wait for pullback to moving average', type: 'entry', order: 2 },
            { id: '1-3', description: 'Use 2:1 reward to risk ratio', type: 'risk', order: 3 }
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: '1',
          order: 1,
          tradeType: 'both',
          tags: ['trend', 'momentum'],
          category: 'trend',
          rating: 4
        },
        {
          id: '2',
          name: 'Breakout Strategy',
          description: 'Trading breakouts from consolidation patterns',
          rules: [
            { id: '2-1', description: 'Identify clear resistance/support level', type: 'entry', order: 1 },
            { id: '2-2', description: 'Enter when price breaks level with volume', type: 'entry', order: 2 },
            { id: '2-3', description: 'Place stop below/above the breakout level', type: 'risk', order: 3 }
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: '1',
          order: 2,
          tradeType: 'both',
          tags: ['breakout', 'momentum'],
          category: 'breakout',
          rating: 3
        }
      ];
      
      setPlaybooks(mockPlaybooks);
    } catch (err) {
      console.error('Error fetching playbooks:', err);
      setError('Failed to load playbooks');
    } finally {
      setIsLoading(false);
    }
  };

  const addPlaybook = async (playbookData: Omit<PlaybookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Since we're using mock data, simply add to local state
      const newPlaybook: PlaybookEntry = {
        ...playbookData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setPlaybooks(prevPlaybooks => [...prevPlaybooks, newPlaybook]);
      return newPlaybook;
    } catch (err) {
      console.error('Error adding playbook:', err);
      throw err;
    }
  };

  const updatePlaybook = async (id: string, playbookData: Partial<PlaybookEntry>) => {
    try {
      // Update in local state
      setPlaybooks(prevPlaybooks => 
        prevPlaybooks.map(playbook => 
          playbook.id === id ? { ...playbook, ...playbookData, updatedAt: new Date().toISOString() } : playbook
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating playbook:', err);
      throw err;
    }
  };

  const deletePlaybook = async (id: string) => {
    try {
      // Remove from local state
      setPlaybooks(prevPlaybooks => prevPlaybooks.filter(playbook => playbook.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting playbook:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  return {
    playbooks,
    isLoading,
    error,
    addPlaybook,
    updatePlaybook,
    deletePlaybook,
    fetchPlaybooks
  };
};
