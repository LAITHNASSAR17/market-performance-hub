
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
  noteTags?: string[];
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedNotes = data?.map(note => ({
        ...note,
        userId: note.user_id,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        tradeId: note.trade_id
      })) || [];
      
      setNotes(formattedNotes);
      
      // Extract all unique tags
      const allTags = formattedNotes.flatMap(note => note.tags || []);
      setNoteTags([...new Set(allTags)]);
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
      
      // Prepare the note for Supabase, mapping property names
      const supabaseNote = {
        title: note.title,
        content: note.content,
        user_id: note.userId || note.user_id,
        tags: note.tags || [],
        trade_id: note.tradeId || note.trade_id
      };
      
      const { data, error } = await supabase
        .from('notes')
        .insert([supabaseNote])
        .select()
        .single();

      if (error) throw error;
      
      const formattedNote = {
        ...data,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tradeId: data.trade_id
      };
      
      setNotes(prev => [formattedNote, ...prev]);
      toast({
        title: "Success",
        description: "Note created successfully"
      });
      
      // Update tags if needed
      if (note.tags && note.tags.length > 0) {
        setNoteTags(prev => [...new Set([...prev, ...note.tags!])]);
      }
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
      
      // Prepare the note update for Supabase
      const supabaseNote: any = {};
      if (note.title) supabaseNote.title = note.title;
      if (note.content) supabaseNote.content = note.content;
      if (note.tags) supabaseNote.tags = note.tags;
      if (note.trade_id || note.tradeId) supabaseNote.trade_id = note.trade_id || note.tradeId;
      
      const { data, error } = await supabase
        .from('notes')
        .update(supabaseNote)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const formattedNote = {
        ...data,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tradeId: data.trade_id
      };
      
      setNotes(prev => prev.map(n => n.id === id ? formattedNote : n));
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(formattedNote);
      }
      
      toast({
        title: "Success",
        description: "Note updated successfully"
      });
      
      // Update tags if needed
      if (note.tags && note.tags.length > 0) {
        setNoteTags(prev => [...new Set([...prev, ...note.tags!])]);
      }
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
      
      // Recalculate tags
      const remainingTags = notes.filter(n => n.id !== id).flatMap(note => note.tags || []);
      setNoteTags([...new Set(remainingTags)]);
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
      setSelectedNote,
      noteTags
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
