
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Note } from '@/types/settings';

interface NotebookContextType {
  notes: Note[];
  noteTags: string[];
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTags, setNoteTags] = useState<string[]>([]);
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

      // Convert to Note[] type
      const fetchedNotes: Note[] = data || [];
      setNotes(fetchedNotes);
      
      // Extract unique tags
      const allTags = fetchedNotes.flatMap(note => note.tags || []);
      setNoteTags(Array.from(new Set(allTags)));
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive"
      });
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...note,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      if (data) {
        setNotes(prev => [data[0] as Note, ...prev]);
        
        // Update tags
        if (note.tags && note.tags.length > 0) {
          setNoteTags(prev => {
            const newTags = note.tags?.filter(tag => !prev.includes(tag)) || [];
            return [...prev, ...newTags];
          });
        }

        toast({
          title: "Success",
          description: "Note added successfully",
        });
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

  const updateNote = async (id: string, note: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...note,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data) {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data[0] } : n));
        
        // Update tags
        if (note.tags) {
          const allTags = notes.flatMap(n => n.id === id ? [] : (n.tags || [])).concat(note.tags);
          setNoteTags(Array.from(new Set(allTags)));
        }

        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      }
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

      setNotes(prev => prev.filter(n => n.id !== id));
      
      // Update tags
      const remainingTags = notes
        .filter(n => n.id !== id)
        .flatMap(n => n.tags || []);
      setNoteTags(Array.from(new Set(remainingTags)));

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
        noteTags,
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

export type { Note };
