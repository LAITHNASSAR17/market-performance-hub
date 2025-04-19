import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/settings';

type NotebookContextType = {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  loading: boolean;
  noteTags: string[];
  addTag: (tag: string) => void;
};

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotes: Note[] = data.map(note => ({
        id: note.id,
        userId: note.user_id,
        title: note.title,
        content: note.content || '',
        tradeId: note.trade_id,
        tags: note.tags || [],
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }));

      setNotes(formattedNotes);
      
      // Extract unique tags
      const uniqueTags = Array.from(new Set(formattedNotes.flatMap(note => note.tags)));
      setNoteTags(prevTags => [...new Set([...prevTags, ...uniqueTags])]);
      
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: noteData.title,
          content: noteData.content,
          trade_id: noteData.tradeId,
          tags: noteData.tags
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content || '',
        tradeId: data.trade_id,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setNotes(prev => [newNote, ...prev]);
      
      // Update tags if new ones were added
      if (noteData.tags.length > 0) {
        setNoteTags(prev => [...new Set([...prev, ...noteData.tags])]);
      }

    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const updateNote = async (id: string, noteUpdate: Partial<Note>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: noteUpdate.title,
          content: noteUpdate.content,
          trade_id: noteUpdate.tradeId,
          tags: noteUpdate.tags
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === id
            ? { ...note, ...noteUpdate, updatedAt: new Date().toISOString() }
            : note
        )
      );

      // Update tags if they changed
      if (noteUpdate.tags) {
        const newTags = noteUpdate.tags.filter(tag => !noteTags.includes(tag));
        if (newTags.length > 0) {
          setNoteTags([...noteTags, ...newTags]);
        }
      }

      toast({
        title: "Updated",
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));

      toast({
        title: "Deleted",
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

  const getNote = (id: string) => {
    return notes.find(note => note.id === id);
  };

  return (
    <NotebookContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNote,
        getNote,
        loading,
        noteTags,
        addTag: (tag: string) => setNoteTags(prev => [...new Set([...prev, tag])])
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
