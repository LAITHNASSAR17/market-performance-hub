
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

interface NotebookContextType {
  notes: Note[];
  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  loading: boolean;
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: `Failed to fetch notes: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .insert([note])
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Note created successfully"
      });
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: `Failed to create note: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .update(note)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => prev.map(n => n.id === id ? data : n));
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(data);
      }
      
      toast({
        title: "Success",
        description: "Note updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: `Failed to update note: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
      
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: `Failed to delete note: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotebookContext.Provider value={{
      notes,
      fetchNotes,
      addNote,
      updateNote,
      deleteNote,
      loading,
      selectedNote,
      setSelectedNote
    }}>
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
