import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

interface NotebookContextType {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotes: Note[] = data.map(note => ({
        id: note.id,
        userId: note.user_id,
        title: note.title,
        content: note.content || '',
        tradeId: note.trade_id || undefined,
        tags: note.tags || [],
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }));

      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes');
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: note.userId,
          title: note.title,
          content: note.content,
          trade_id: note.tradeId,
          tags: note.tags
        })
        .select()
        .single();

      if (error) throw error;

      await fetchNotes(); // Refresh notes list
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: note.title,
          content: note.content,
          trade_id: note.tradeId,
          tags: note.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchNotes(); // Refresh notes list
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNotes(); // Refresh notes list
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  return (
    <NotebookContext.Provider
      value={{
        notes,
        isLoading,
        error,
        addNote,
        updateNote,
        deleteNote
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};

export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if (context === undefined) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
};

// Export Note type for components that need it
export type { Note };
