import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ITrade } from '@/services/tradeService';

// Define Playbook interface
export interface Playbook {
  id: string;
  name: string;
  description: string;
  rules: string[];
  tags: string[];
  userId: string;
  created_at: string;
}

// Convert database playbook to our app model
const formatPlaybook = (dbPlaybook: any): Playbook => ({
  id: dbPlaybook.id,
  name: dbPlaybook.name,
  description: dbPlaybook.description || '',
  rules: dbPlaybook.rules || [],
  tags: dbPlaybook.tags || [],
  userId: dbPlaybook.user_id,
  created_at: dbPlaybook.created_at
});

// Convert database trade to ITrade format
const formatTrade = (dbTrade: any): ITrade => ({
  id: dbTrade.id,
  userId: dbTrade.user_id,
  symbol: dbTrade.symbol,
  entryPrice: dbTrade.entry_price,
  exitPrice: dbTrade.exit_price,
  quantity: dbTrade.quantity,
  direction: dbTrade.direction === 'Buy' ? 'long' : 'short',
  entryDate: new Date(dbTrade.entry_date),
  exitDate: dbTrade.exit_date ? new Date(dbTrade.exit_date) : null,
  profitLoss: dbTrade.profit_loss,
  fees: dbTrade.fees || 0,
  notes: dbTrade.notes || '',
  tags: dbTrade.tags || [],
  createdAt: new Date(dbTrade.created_at),
  updatedAt: new Date(dbTrade.updated_at || dbTrade.created_at),
  rating: dbTrade.rating || 0,
  stopLoss: dbTrade.stop_loss,
  takeProfit: dbTrade.take_profit,
  durationMinutes: dbTrade.duration_minutes,
  playbook: dbTrade.playbook,
  followedRules: dbTrade.followed_rules || [],
  marketSession: dbTrade.market_session
});

export const usePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      // Check if playbooks table exists, if not use mock data
      const { data, error } = await supabase
        .from('playbooks')
        .select('*');

      if (error) {
        console.error('Error or table does not exist:', error);
        // Use mock data for now
        const mockPlaybooks: Playbook[] = [
          {
            id: '1',
            name: 'Breakout Strategy',
            description: 'A strategy for trading breakouts from consolidation patterns.',
            rules: [
              'Wait for price to consolidate in a range',
              'Enter when price breaks out with increased volume',
              'Place stop loss below the consolidation range',
              'Take profit at 1:2 risk-reward ratio'
            ],
            tags: ['breakout', 'momentum', 'technical'],
            userId: '1',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Trend Following',
            description: 'A strategy that follows established market trends.',
            rules: [
              'Identify the trend using higher timeframes',
              'Enter on pullbacks in trend direction',
              'Trail stop loss as trend develops',
              'Exit when trend reversal signals appear'
            ],
            tags: ['trend', 'swing', 'technical'],
            userId: '1',
            created_at: new Date().toISOString()
          }
        ];
        setPlaybooks(mockPlaybooks);
        setIsLoading(false);
        return;
      }

      if (data) {
        const formattedPlaybooks = data.map(formatPlaybook);
        setPlaybooks(formattedPlaybooks);
      }
    } catch (error) {
      console.error('Error fetching playbooks:', error);
      setError('Failed to fetch playbooks');
      
      // Fallback to mock data
      const mockPlaybooks: Playbook[] = [
        {
          id: '1',
          name: 'Breakout Strategy',
          description: 'A strategy for trading breakouts from consolidation patterns.',
          rules: [
            'Wait for price to consolidate in a range',
            'Enter when price breaks out with increased volume',
            'Place stop loss below the consolidation range',
            'Take profit at 1:2 risk-reward ratio'
          ],
          tags: ['breakout', 'momentum', 'technical'],
          userId: '1',
          created_at: new Date().toISOString()
        }
      ];
      setPlaybooks(mockPlaybooks);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaybookTrades = async (playbookId: string): Promise<ITrade[]> => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('playbook', playbookId);

      if (error) throw error;

      // Convert to ITrade format
      return data.map(formatTrade);
    } catch (error) {
      console.error('Error fetching playbook trades:', error);
      return [];
    }
  };

  const addPlaybook = async (playbook: Omit<Playbook, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('playbooks')
        .insert({
          name: playbook.name,
          description: playbook.description,
          rules: playbook.rules,
          tags: playbook.tags,
          user_id: playbook.userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedPlaybook = formatPlaybook(data);
        setPlaybooks([...playbooks, formattedPlaybook]);
        toast({
          title: "Success",
          description: "Playbook added successfully",
        });
      }
    } catch (error) {
      console.error('Error adding playbook:', error);
      toast({
        title: "Error",
        description: "Failed to add playbook",
        variant: "destructive"
      });
    }
  };

  const updatePlaybook = async (id: string, playbook: Partial<Playbook>) => {
    try {
      const { data, error } = await supabase
        .from('playbooks')
        .update({
          name: playbook.name,
          description: playbook.description,
          rules: playbook.rules,
          tags: playbook.tags
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedPlaybook = formatPlaybook(data);
        setPlaybooks(playbooks.map(p => (p.id === id ? formattedPlaybook : p)));
        toast({
          title: "Success",
          description: "Playbook updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating playbook:', error);
      toast({
        title: "Error",
        description: "Failed to update playbook",
        variant: "destructive"
      });
    }
  };

  const deletePlaybook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('playbooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlaybooks(playbooks.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Playbook deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting playbook:', error);
      toast({
        title: "Error",
        description: "Failed to delete playbook",
        variant: "destructive"
      });
    }
  };

  return {
    playbooks,
    isLoading,
    error,
    getPlaybookTrades,
    addPlaybook,
    updatePlaybook,
    deletePlaybook
  };
};
