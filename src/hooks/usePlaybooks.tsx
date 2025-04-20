
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { PlaybookEntry, PlaybookRule } from '@/types/settings';

// Re-export the PlaybookEntry and PlaybookRule types
export type { PlaybookEntry, PlaybookRule };

export const usePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<PlaybookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('playbooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert database snake_case to camelCase
      const mappedPlaybooks: PlaybookEntry[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        setup: item.setup || '',
        rules: item.rules || [],
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user_id,
        order_number: item.order_number || 0,
        is_private: item.is_private || false,
        trade_type: item.trade_type || 'both',
        tags: item.tags || [],
        category: item.category,
        rating: item.rating,
        r_multiple: item.r_multiple,
        win_rate: item.win_rate,
        expected_value: item.expected_value,
        profit_factor: item.profit_factor,
        net_profit_loss: item.net_profit_loss,
        total_trades: item.total_trades,
        avg_winner: item.avg_winner,
        avg_loser: item.avg_loser,
        missed_trades: item.missed_trades,
        
        // For backward compatibility
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        userId: item.user_id,
        order: item.order_number,
        isPrivate: item.is_private,
        tradeType: item.trade_type as 'long' | 'short' | 'both',
        rMultiple: item.r_multiple,
        winRate: item.win_rate,
        expectedValue: item.expected_value,
        profitFactor: item.profit_factor,
        netProfitLoss: item.net_profit_loss,
        totalTrades: item.total_trades,
        missedTrades: item.missed_trades
      }));

      setPlaybooks(mappedPlaybooks);
    } catch (error) {
      console.error('Error fetching playbooks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch playbooks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPlaybook = async (newPlaybook: Omit<PlaybookEntry, 'id'>) => {
    try {
      // Convert to database format (snake_case)
      const dbPlaybook = {
        name: newPlaybook.name,
        description: newPlaybook.description,
        setup: newPlaybook.setup,
        rules: newPlaybook.rules,
        is_active: newPlaybook.is_active || newPlaybook.isActive || true,
        user_id: newPlaybook.user_id || newPlaybook.userId || 'current-user',
        order_number: newPlaybook.order_number || newPlaybook.order || 0,
        is_private: newPlaybook.is_private || newPlaybook.isPrivate || false,
        trade_type: newPlaybook.trade_type || newPlaybook.tradeType || 'both',
        tags: newPlaybook.tags || [],
        category: newPlaybook.category || 'other',
        rating: newPlaybook.rating || 0,
        r_multiple: newPlaybook.r_multiple || newPlaybook.rMultiple || 0,
        win_rate: newPlaybook.win_rate || newPlaybook.winRate || 0,
        expected_value: newPlaybook.expected_value || newPlaybook.expectedValue || 0,
        profit_factor: newPlaybook.profit_factor || newPlaybook.profitFactor || 0,
        net_profit_loss: newPlaybook.net_profit_loss || newPlaybook.netProfitLoss || 0,
        total_trades: newPlaybook.total_trades || newPlaybook.totalTrades || 0,
        avg_winner: newPlaybook.avg_winner || newPlaybook.avgWinner || 0,
        avg_loser: newPlaybook.avg_loser || newPlaybook.avgLoser || 0,
        missed_trades: newPlaybook.missed_trades || newPlaybook.missedTrades || 0
      };

      const { data, error } = await supabase
        .from('playbooks')
        .insert([dbPlaybook])
        .select();

      if (error) throw error;

      if (data) {
        // Update playbooks state with mapped data
        await fetchPlaybooks();
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

  const updatePlaybook = async (id: string, updatedData: Partial<PlaybookEntry>) => {
    try {
      // Convert to database format (snake_case)
      const dbUpdates: any = {};
      
      if (updatedData.name !== undefined) dbUpdates.name = updatedData.name;
      if (updatedData.description !== undefined) dbUpdates.description = updatedData.description;
      if (updatedData.setup !== undefined) dbUpdates.setup = updatedData.setup;
      if (updatedData.rules !== undefined) dbUpdates.rules = updatedData.rules;
      if (updatedData.is_active !== undefined) dbUpdates.is_active = updatedData.is_active;
      if (updatedData.isActive !== undefined) dbUpdates.is_active = updatedData.isActive;
      if (updatedData.is_private !== undefined) dbUpdates.is_private = updatedData.is_private;
      if (updatedData.isPrivate !== undefined) dbUpdates.is_private = updatedData.isPrivate;
      if (updatedData.trade_type !== undefined) dbUpdates.trade_type = updatedData.trade_type;
      if (updatedData.tradeType !== undefined) dbUpdates.trade_type = updatedData.tradeType;
      if (updatedData.tags !== undefined) dbUpdates.tags = updatedData.tags;
      if (updatedData.category !== undefined) dbUpdates.category = updatedData.category;
      if (updatedData.rating !== undefined) dbUpdates.rating = updatedData.rating;
      if (updatedData.r_multiple !== undefined) dbUpdates.r_multiple = updatedData.r_multiple;
      if (updatedData.rMultiple !== undefined) dbUpdates.r_multiple = updatedData.rMultiple;
      if (updatedData.win_rate !== undefined) dbUpdates.win_rate = updatedData.win_rate;
      if (updatedData.winRate !== undefined) dbUpdates.win_rate = updatedData.winRate;
      if (updatedData.expected_value !== undefined) dbUpdates.expected_value = updatedData.expected_value;
      if (updatedData.expectedValue !== undefined) dbUpdates.expected_value = updatedData.expectedValue;
      if (updatedData.profit_factor !== undefined) dbUpdates.profit_factor = updatedData.profit_factor;
      if (updatedData.profitFactor !== undefined) dbUpdates.profit_factor = updatedData.profitFactor;
      if (updatedData.net_profit_loss !== undefined) dbUpdates.net_profit_loss = updatedData.net_profit_loss;
      if (updatedData.netProfitLoss !== undefined) dbUpdates.net_profit_loss = updatedData.netProfitLoss;
      if (updatedData.total_trades !== undefined) dbUpdates.total_trades = updatedData.total_trades;
      if (updatedData.totalTrades !== undefined) dbUpdates.total_trades = updatedData.totalTrades;
      if (updatedData.avg_winner !== undefined) dbUpdates.avg_winner = updatedData.avg_winner;
      if (updatedData.avgWinner !== undefined) dbUpdates.avg_winner = updatedData.avgWinner;
      if (updatedData.avg_loser !== undefined) dbUpdates.avg_loser = updatedData.avg_loser;
      if (updatedData.avgLoser !== undefined) dbUpdates.avg_loser = updatedData.avgLoser;
      if (updatedData.missed_trades !== undefined) dbUpdates.missed_trades = updatedData.missed_trades;
      if (updatedData.missedTrades !== undefined) dbUpdates.missed_trades = updatedData.missedTrades;
      
      const { error } = await supabase
        .from('playbooks')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update state after successful DB update
      await fetchPlaybooks();
      
      toast({
        title: "Success",
        description: "Playbook updated successfully",
      });
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

      setPlaybooks(playbooks.filter(playbook => playbook.id !== id));
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

  return { playbooks, isLoading, addPlaybook, updatePlaybook, deletePlaybook };
};
