
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const [noteTags, setNoteTags] = useState<string[]>([
    'strategy', 'psychology', 'risk', 'plan', 'improvement', 'analysis'
  ]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch notes from Supabase instead of localStorage
  useEffect(() => {
    const fetchNotes = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const formattedNotes: Note[] = data.map(note => ({
            id: note.id,
            userId: note.user_id,
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            createdAt: note.created_at,
            updatedAt: note.updated_at
          }));

          setNotes(formattedNotes);

          // Extract all unique tags
          const uniqueTags = Array.from(new Set(
            formattedNotes.flatMap(note => note.tags)
          ));
          setNoteTags(prevTags => [
            ...prevTags,
            ...uniqueTags.filter(tag => !prevTags.includes(tag))
          ]);
        } catch (error) {
          console.error('Error fetching notes:', error);
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء جلب الملاحظات",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      } else {
        setNotes([]);
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user, toast]);

  // Add note to Supabase
  const addNote = async (newNoteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: newNoteData.title,
          content: newNoteData.content,
          tags: newNoteData.tags || []
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setNotes(prevNotes => [newNote, ...prevNotes]);

      // Update tags
      const newTags = newNote.tags.filter(tag => !noteTags.includes(tag));
      if (newTags.length > 0) {
        setNoteTags([...noteTags, ...newTags]);
      }

      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الملاحظة",
        variant: "destructive"
      });
    }
  };

  // Update note in Supabase
  const updateNote = async (id: string, noteUpdate: Partial<Note>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: noteUpdate.title,
          content: noteUpdate.content,
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
        title: "تم التحديث",
        description: "تم تحديث الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الملاحظة",
        variant: "destructive"
      });
    }
  };

  // Delete note from Supabase
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
        title: "تم الحذف",
        description: "تم حذف الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الملاحظة",
        variant: "destructive"
      });
    }
  };

  const getNote = (id: string) => {
    return notes.find(note => note.id === id);
  };

  const addTag = (tag: string) => {
    if (!noteTags.includes(tag)) {
      setNoteTags([...noteTags, tag]);
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
