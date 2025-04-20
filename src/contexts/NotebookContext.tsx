
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getNotesByUserId, createNote, updateNote, deleteNote } from '@/services/noteService';

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
  error: string | null;
  refreshNotes: () => Promise<void>;
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

  // استرجاع الملاحظات من Supabase
  const fetchNotes = async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching notes for user:', user.id);
        const data = await getNotesByUserId(user.id);

        const formattedNotes: Note[] = data.map(note => ({
          id: note.id,
          userId: note.user_id,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          tradeId: note.trade_id
        }));

        console.log('Formatted notes:', formattedNotes.length);
        setNotes(formattedNotes);

        // استخراج جميع العلامات الفريدة
        const uniqueTags = Array.from(new Set(
          formattedNotes.flatMap(note => note.tags)
        ));
        setNoteTags(prevTags => [
          ...prevTags,
          ...uniqueTags.filter(tag => !prevTags.includes(tag))
        ]);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('حدث خطأ أثناء جلب الملاحظات');
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب الملاحظات",
          variant: "destructive"
        });
        
        // استخدام بيانات محلية إذا كان المستخدم هو حساب الاختبار
        if (user.id === 'test-user-id-123456') {
          setNotes([
            {
              id: 'note-fallback-1',
              userId: 'test-user-id-123456',
              title: 'ملاحظة اختبارية 1',
              content: 'هذه ملاحظة محلية للاختبار عندما يفشل الاتصال بالخادم',
              tags: ['اختبار', 'مثال'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'note-fallback-2',
              userId: 'test-user-id-123456',
              title: 'استراتيجية التداول',
              content: 'مراقبة مستويات الدعم والمقاومة وتحديد الاتجاه العام للسوق قبل اتخاذ قرار الدخول',
              tags: ['استراتيجية', 'تحليل'],
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString()
            }
          ]);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setNotes([]);
      setLoading(false);
      setError(null);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user, toast]);

  // إعادة تحميل الملاحظات
  const refreshNotes = async () => {
    await fetchNotes();
  };

  // إضافة ملاحظة إلى Supabase
  const addNote = async (newNoteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const result = await createNote({
        title: newNoteData.title,
        content: newNoteData.content,
        tags: newNoteData.tags || [],
        userId: user.id
      });

      const data = result?.[0];
      if (data) {
        const newNote: Note = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          tradeId: data.trade_id
        };

        setNotes(prevNotes => [newNote, ...prevNotes]);

        // تحديث العلامات
        const newTags = newNote.tags.filter(tag => !noteTags.includes(tag));
        if (newTags.length > 0) {
          setNoteTags([...noteTags, ...newTags]);
        }

        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة الملاحظة بنجاح",
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الملاحظة",
        variant: "destructive"
      });
      
      // إضافة ملاحظة محلية للاستمرار في العمل
      if (user.id === 'test-user-id-123456') {
        const tempId = `note-fallback-${Date.now()}`;
        const newNote: Note = {
          id: tempId,
          userId: user.id,
          title: newNoteData.title,
          content: newNoteData.content,
          tags: newNoteData.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tradeId: newNoteData.tradeId
        };
        
        setNotes(prevNotes => [newNote, ...prevNotes]);
        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة الملاحظة محليًا",
        });
      }
    }
  };

  // تحديث ملاحظة في Supabase
  const updateNoteHandler = async (id: string, noteUpdate: Partial<Note>) => {
    if (!user) return;

    try {
      const result = await updateNote(id, {
        title: noteUpdate.title,
        content: noteUpdate.content,
        tags: noteUpdate.tags
      });

      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === id
            ? { ...note, ...noteUpdate, updatedAt: new Date().toISOString() }
            : note
        )
      );

      // تحديث العلامات إذا تغيرت
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
      
      // إذا كان معرف الملاحظة يبدأ بـ "note-fallback"، نقوم بالتحديث محليًا
      if (id.startsWith('note-fallback')) {
        setNotes(prevNotes =>
          prevNotes.map(note =>
            note.id === id
              ? { ...note, ...noteUpdate, updatedAt: new Date().toISOString() }
              : note
          )
        );
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث الملاحظة محليًا",
        });
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث الملاحظة",
          variant: "destructive"
        });
      }
    }
  };

  // حذف ملاحظة من Supabase
  const deleteNoteHandler = async (id: string) => {
    if (!user) return;

    try {
      if (!id.startsWith('note-fallback')) {
        await deleteNote(id);
      }

      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));

      toast({
        title: "تم الحذف",
        description: "تم حذف الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // إذا كانت ملاحظة اختبارية، نقوم بالحذف محليًا
      if (id.startsWith('note-fallback')) {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
        
        toast({
          title: "تم الحذف",
          description: "تم حذف الملاحظة محليًا",
        });
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف الملاحظة",
          variant: "destructive"
        });
      }
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
      updateNote: updateNoteHandler, 
      deleteNote: deleteNoteHandler, 
      getNote,
      loading,
      noteTags,
      addTag,
      error,
      refreshNotes
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
