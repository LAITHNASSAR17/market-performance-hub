
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

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

// Sample notes for demonstration
const sampleNotes: Note[] = [
  {
    id: '1',
    userId: '1',
    title: 'Risk Management Strategy',
    content: 'Always limit risk to 2% per trade. For volatile pairs like GBP/USD, consider reducing to 1.5%.',
    tags: ['risk', 'strategy'],
    createdAt: '2025-04-10T15:30:00Z',
    updatedAt: '2025-04-10T15:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    title: 'EUR/USD Trading Plan',
    content: 'Focus on trading during London/NY overlap. Look for retracements to key support/resistance levels.',
    tradeId: '1',
    tags: ['plan', 'EUR/USD'],
    createdAt: '2025-04-09T12:15:00Z',
    updatedAt: '2025-04-09T13:45:00Z'
  },
  {
    id: '3',
    userId: '1',
    title: 'Psychology Notes',
    content: 'Need to work on patience. Too many trades taken out of boredom rather than conviction.',
    tags: ['psychology', 'improvement'],
    createdAt: '2025-04-08T09:45:00Z',
    updatedAt: '2025-04-08T09:45:00Z'
  }
];

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteTags, setNoteTags] = useState<string[]>([
    'strategy', 'psychology', 'risk', 'plan', 'improvement', 'analysis'
  ]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load notes from localStorage or use sample data
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        // Use sample data on first load
        setNotes(sampleNotes);
        localStorage.setItem('notes', JSON.stringify(sampleNotes));
      }

      // Extract all unique tags
      const tagSet = new Set<string>();
      sampleNotes.forEach(note => {
        note.tags.forEach(tag => tagSet.add(tag));
      });
      setNoteTags(prev => Array.from(new Set([...prev, ...tagSet])));
    } else {
      setNotes([]);
    }
    setLoading(false);
  }, [user]);

  const addNote = (newNoteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date().toISOString();
    const newNote: Note = {
      ...newNoteData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: now,
      updatedAt: now
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    // Update tags
    const newTags = newNote.tags.filter(tag => !noteTags.includes(tag));
    if (newTags.length > 0) {
      setNoteTags([...noteTags, ...newTags]);
    }

    toast({
      title: "Note Added",
      description: "Your note has been added successfully",
    });
  };

  const updateNote = (id: string, noteUpdate: Partial<Note>) => {
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) return;

    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = { 
      ...updatedNotes[noteIndex], 
      ...noteUpdate,
      updatedAt: new Date().toISOString()
    };
    
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    // Update tags if they changed
    if (noteUpdate.tags) {
      const newTags = noteUpdate.tags.filter(tag => !noteTags.includes(tag));
      if (newTags.length > 0) {
        setNoteTags([...noteTags, ...newTags]);
      }
    }

    toast({
      title: "Note Updated",
      description: "Your note has been updated successfully",
    });
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    toast({
      title: "Note Deleted",
      description: "Your note has been deleted successfully",
    });
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
