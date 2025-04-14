
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export type Note = {
  id: string;
  userId: string;
  title: string;
  content: string;
  tradeId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

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

  // Fetch notes from Supabase when user changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        setNotes([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const formattedNotes = data.map(note => ({
          id: note.id,
          userId: note.user_id,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
          createdAt: note.created_at,
          updatedAt: note.updated_at
        }));

        setNotes(formattedNotes);
        
        // Extract unique tags
        const uniqueTags = new Set<string>();
        formattedNotes.forEach(note => {
          note.tags.forEach(tag => uniqueTags.add(tag));
        });
        setNoteTags(Array.from(uniqueTags));
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user, toast]);

  const addNote = async (newNoteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: newNoteData.title,
          content: newNoteData.content,
          tags: newNoteData.tags
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setNotes(prev => [...prev, newNote]);

      // Update tags
      const newTags = newNote.tags.filter(tag => !noteTags.includes(tag));
      if (newTags.length > 0) {
        setNoteTags(prev => [...prev, ...newTags]);
      }

      toast({
        title: "Note Added",
        description: "Your note has been added successfully",
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

  const updateNote = async (id: string, noteUpdate: Partial<Note>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: noteUpdate.title,
          content: noteUpdate.content,
          tags: noteUpdate.tags
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === id ? {
          ...note,
          ...data,
          updatedAt: data.updated_at
        } : note
      ));

      // Update tags if they changed
      if (noteUpdate.tags) {
        const newTags = noteUpdate.tags.filter(tag => !noteTags.includes(tag));
        if (newTags.length > 0) {
          setNoteTags(prev => [...prev, ...newTags]);
        }
      }

      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully",
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

      setNotes(prev => prev.filter(note => note.id !== id));

      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully",
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

  const addTag = (tag: string) => {
    if (!noteTags.includes(tag)) {
      setNoteTags(prev => [...prev, tag]);
    }
  };

  return (
    <NotebookContext.Provider value={{ 
      notes, 
      addNote, 
      updateNote, 
      deleteNote, 
      getNote,
      loading,
      noteTags,
      addTag
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
