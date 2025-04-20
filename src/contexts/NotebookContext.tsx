
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import * as noteService from '@/services/noteService';

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
  error: string | null;
  refreshNotes: () => Promise<void>;
  noteTags: string[];
  addTag: (tag: string) => void;
};

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteTags, setNoteTags] = useState<string[]>([
    'strategy', 'psychology', 'risk', 'plan', 'improvement', 'analysis'
  ]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch notes from Supabase
  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedNotes = await noteService.getNotesByUserId(user.id);
      
      // Convert from API format to our Note type
      const formattedNotes: Note[] = fetchedNotes.map(note => ({
        id: note.id,
        userId: note.userId,
        title: note.title,
        content: note.content,
        tradeId: note.tradeId,
        tags: note.tags || [],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
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
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError("حدث خطأ أثناء جلب الملاحظات");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الملاحظات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount or when user changes
  useEffect(() => {
    fetchNotes();
  }, [user, toast]);

  // Add note to Supabase
  const addNote = async (newNoteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const data = await noteService.createNote({
        title: newNoteData.title,
        content: newNoteData.content,
        tags: newNoteData.tags || [],
        userId: user.id,
        tradeId: newNoteData.tradeId
      });

      if (!data || data.length === 0) {
        throw new Error("Failed to create note");
      }

      const newNote: Note = {
        id: data[0].id,
        userId: data[0].user_id,
        title: data[0].title,
        content: data[0].content || '',
        tradeId: data[0].trade_id,
        tags: data[0].tags || [],
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at
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
      const data = await noteService.updateNote(id, {
        title: noteUpdate.title,
        content: noteUpdate.content,
        tags: noteUpdate.tags,
        tradeId: noteUpdate.tradeId
      });

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
      await noteService.deleteNote(id);

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

  const refreshNotes = async () => {
    await fetchNotes();
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
      error,
      refreshNotes,
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
