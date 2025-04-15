
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { noteService, INote, IFolder, ITemplate } from '@/services/noteService';

type Filter = 'all' | 'favorites' | 'folder' | 'tag' | 'search';

type NotebookContextType = {
  notes: INote[];
  folders: IFolder[];
  templates: ITemplate[];
  currentFilter: Filter;
  currentFilterValue: string;
  currentNote: INote | null;
  loadingNotes: boolean;
  noteTags: string[];
  
  // Note operations
  addNote: (note: Omit<INote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<INote | null>;
  updateNote: (id: string, note: Partial<INote>) => Promise<INote | null>;
  deleteNote: (id: string, permanent?: boolean) => Promise<boolean>;
  getNote: (id: string) => Promise<INote | null>;
  setCurrentNote: (note: INote | null) => void;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<boolean>;
  moveNoteToFolder: (id: string, folderId: string | null) => Promise<boolean>;
  
  // Folder operations
  addFolder: (name: string, color?: string, icon?: string) => Promise<IFolder | null>;
  updateFolder: (id: string, name: string, color?: string, icon?: string) => Promise<IFolder | null>;
  deleteFolder: (id: string) => Promise<boolean>;
  
  // Template operations
  addTemplate: (template: Omit<ITemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<ITemplate | null>;
  updateTemplate: (id: string, template: Partial<ITemplate>) => Promise<ITemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  
  // Filter operations
  setFilter: (filter: Filter, value?: string) => void;
  searchNotes: (query: string) => void;
  
  // Tags
  addTag: (tag: string) => void;
};

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<INote[]>([]);
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [currentFilter, setCurrentFilter] = useState<Filter>('all');
  const [currentFilterValue, setCurrentFilterValue] = useState<string>('');
  const [currentNote, setCurrentNote] = useState<INote | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [noteTags, setNoteTags] = useState<string[]>([
    'strategy', 'psychology', 'risk', 'plan', 'improvement', 'analysis'
  ]);

  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoadingNotes(true);
        try {
          // Fetch notes, folders, and templates
          const [notesData, foldersData, templatesData] = await Promise.all([
            noteService.getAllNotes(),
            noteService.getAllFolders(),
            noteService.getAllTemplates()
          ]);

          setNotes(notesData);
          setFolders(foldersData);
          setTemplates(templatesData);

          // Extract all unique tags
          const uniqueTags = Array.from(new Set(
            notesData.flatMap(note => note.tags)
          ));
          setNoteTags(prevTags => [
            ...prevTags,
            ...uniqueTags.filter(tag => !prevTags.includes(tag))
          ]);
        } catch (error) {
          console.error('Error fetching notebook data:', error);
          toast({
            title: "Error",
            description: "Failed to load notebook data",
            variant: "destructive"
          });
        } finally {
          setLoadingNotes(false);
        }
      } else {
        setNotes([]);
        setFolders([]);
        setTemplates([]);
        setLoadingNotes(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Filter notes based on current filter
  useEffect(() => {
    const applyFilter = async () => {
      if (!user) {
        setNotes([]);
        return;
      }

      setLoadingNotes(true);
      try {
        let filteredNotes: INote[] = [];
        
        switch (currentFilter) {
          case 'all':
            filteredNotes = await noteService.getAllNotes();
            break;
          case 'favorites':
            filteredNotes = await noteService.getFavoritedNotes();
            break;
          case 'folder':
            if (currentFilterValue) {
              filteredNotes = await noteService.getNotesByFolder(currentFilterValue);
            }
            break;
          case 'tag':
            if (currentFilterValue) {
              filteredNotes = await noteService.getNotesByTag(currentFilterValue);
            }
            break;
          case 'search':
            if (currentFilterValue) {
              filteredNotes = await noteService.searchNotes(currentFilterValue);
            }
            break;
        }

        setNotes(filteredNotes);
      } catch (error) {
        console.error('Error filtering notes:', error);
        toast({
          title: "Error",
          description: "Failed to filter notes",
          variant: "destructive"
        });
      } finally {
        setLoadingNotes(false);
      }
    };

    applyFilter();
  }, [currentFilter, currentFilterValue, user, toast]);

  // Note operations
  const addNote = async (noteData: Omit<INote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    try {
      const newNote = await noteService.createNote(noteData);
      setNotes(prevNotes => [newNote, ...prevNotes]);

      // Update tags
      const newTags = newNote.tags.filter(tag => !noteTags.includes(tag));
      if (newTags.length > 0) {
        setNoteTags([...noteTags, ...newTags]);
      }

      toast({
        title: "Note Added",
        description: "Your note has been created successfully"
      });
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateNote = async (id: string, noteData: Partial<INote>) => {
    if (!user) return null;

    try {
      const updatedNote = await noteService.updateNote(id, noteData);
      if (!updatedNote) throw new Error('Failed to update note');

      setNotes(prevNotes =>
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );

      // If current note is being updated, update that too
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }

      // Update tags if they changed
      if (noteData.tags) {
        const newTags = noteData.tags.filter(tag => !noteTags.includes(tag));
        if (newTags.length > 0) {
          setNoteTags([...noteTags, ...newTags]);
        }
      }

      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully"
      });
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteNote = async (id: string, permanent: boolean = false) => {
    if (!user) return false;

    try {
      const success = await noteService.deleteNote(id, permanent);
      if (!success) throw new Error('Failed to delete note');

      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));

      // If deleted note is current note, clear current note
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }

      toast({
        title: "Note Deleted",
        description: permanent 
          ? "Your note has been permanently deleted" 
          : "Your note has been moved to trash"
      });
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
      return false;
    }
  };

  const getNote = async (id: string) => {
    return await noteService.getNoteById(id);
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    const note = notes.find(n => n.id === id);
    if (!note) return false;

    const updated = await updateNote(id, { isFavorite });
    return !!updated;
  };

  const moveNoteToFolder = async (id: string, folderId: string | null) => {
    const note = notes.find(n => n.id === id);
    if (!note) return false;

    const updated = await updateNote(id, { folderId });
    return !!updated;
  };

  // Folder operations
  const addFolder = async (name: string, color?: string, icon?: string) => {
    if (!user) return null;

    try {
      const newFolder = await noteService.createFolder(name, color, icon);
      if (!newFolder) throw new Error('Failed to create folder');

      setFolders(prevFolders => [...prevFolders, newFolder]);

      toast({
        title: "Folder Created",
        description: "Your folder has been created successfully"
      });
      return newFolder;
    } catch (error) {
      console.error('Error adding folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateFolder = async (id: string, name: string, color?: string, icon?: string) => {
    if (!user) return null;

    try {
      const updatedFolder = await noteService.updateFolder(id, name, color, icon);
      if (!updatedFolder) throw new Error('Failed to update folder');

      setFolders(prevFolders =>
        prevFolders.map(folder => folder.id === id ? updatedFolder : folder)
      );

      toast({
        title: "Folder Updated",
        description: "Your folder has been updated successfully"
      });
      return updatedFolder;
    } catch (error) {
      console.error('Error updating folder:', error);
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteFolder = async (id: string) => {
    if (!user) return false;

    try {
      const success = await noteService.deleteFolder(id);
      if (!success) throw new Error('Failed to delete folder');

      setFolders(prevFolders => prevFolders.filter(folder => folder.id !== id));

      // Update any notes in this folder to not have a folder
      setNotes(prevNotes =>
        prevNotes.map(note => 
          note.folderId === id 
            ? { ...note, folderId: undefined } 
            : note
        )
      );

      toast({
        title: "Folder Deleted",
        description: "Your folder has been deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
      return false;
    }
  };

  // Template operations
  const addTemplate = async (templateData: Omit<ITemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    try {
      const newTemplate = await noteService.createTemplate(templateData);
      if (!newTemplate) throw new Error('Failed to create template');

      setTemplates(prevTemplates => [...prevTemplates, newTemplate]);

      toast({
        title: "Template Created",
        description: "Your template has been created successfully"
      });
      return newTemplate;
    } catch (error) {
      console.error('Error adding template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<ITemplate>) => {
    if (!user) return null;

    try {
      const updatedTemplate = await noteService.updateTemplate(id, templateData);
      if (!updatedTemplate) throw new Error('Failed to update template');

      setTemplates(prevTemplates =>
        prevTemplates.map(template => template.id === id ? updatedTemplate : template)
      );

      toast({
        title: "Template Updated",
        description: "Your template has been updated successfully"
      });
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return false;

    try {
      const success = await noteService.deleteTemplate(id);
      if (!success) throw new Error('Failed to delete template');

      setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== id));

      toast({
        title: "Template Deleted",
        description: "Your template has been deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
      return false;
    }
  };

  // Filter operations
  const setFilter = (filter: Filter, value: string = '') => {
    setCurrentFilter(filter);
    setCurrentFilterValue(value);
  };

  const searchNotes = (query: string) => {
    setFilter('search', query);
  };

  // Tags
  const addTag = (tag: string) => {
    if (!noteTags.includes(tag)) {
      setNoteTags([...noteTags, tag]);
    }
  };

  return (
    <NotebookContext.Provider value={{
      notes,
      folders,
      templates,
      currentFilter,
      currentFilterValue,
      currentNote,
      loadingNotes,
      noteTags,
      addNote,
      updateNote,
      deleteNote,
      getNote,
      setCurrentNote,
      toggleFavorite,
      moveNoteToFolder,
      addFolder,
      updateFolder,
      deleteFolder,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      setFilter,
      searchNotes,
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
