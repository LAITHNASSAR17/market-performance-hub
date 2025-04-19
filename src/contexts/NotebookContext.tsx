
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/settings';

interface NotebookContextType {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database fields to our Note interface
      const formattedNotes: Note[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        content: item.content || '',
        tags: item.tags || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        tradeId: item.trade_id
      }));
      
      setNotes(formattedNotes);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: note.title,
          content: note.content,
          tags: note.tags,
          trade_id: note.tradeId,
          user_id: 'test-user-id' // Replace with actual user ID
        })
        .select()
        .single();

      if (error) throw error;
      
      // Map database response to our Note interface
      const newNote: Note = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content || '',
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tradeId: data.trade_id
      };

      setNotes(prevNotes => [...prevNotes, newNote]);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
    }
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    try {
      // Convert Note interface fields to database field names
      const updateData: any = {};
      if (note.title !== undefined) updateData.title = note.title;
      if (note.content !== undefined) updateData.content = note.content;
      if (note.tags !== undefined) updateData.tags = note.tags;
      if (note.tradeId !== undefined) updateData.trade_id = note.tradeId;

      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Map database response to our Note interface
      const updatedNote: Note = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content || '',
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tradeId: data.trade_id
      };

      setNotes(prevNotes =>
        prevNotes.map(existingNote => (existingNote.id === id ? updatedNote : existingNote))
      );
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
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
        deleteNote,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};

export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
};
