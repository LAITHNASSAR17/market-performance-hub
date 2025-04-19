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

      setPlaybooks(data as PlaybookEntry[]);
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
      const { data, error } = await supabase
        .from('playbooks')
        .insert([newPlaybook])
        .select();

      if (error) throw error;

      setPlaybooks([...playbooks, ...(data as PlaybookEntry[])]);
      toast({
        title: "Success",
        description: "Playbook added successfully",
      });
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
      const { data, error } = await supabase
        .from('playbooks')
        .update(updatedData)
        .eq('id', id)
        .select();

      if (error) throw error;

      setPlaybooks(playbooks.map(playbook =>
        playbook.id === id ? { ...playbook, ...updatedData } : playbook
      ));
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
