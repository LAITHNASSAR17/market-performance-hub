
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useNotebook } from '@/contexts/NotebookContext';
import Sidebar from '@/components/notebook/Sidebar';
import NotesList from '@/components/notebook/NotesList';
import NoteEditor from '@/components/notebook/NoteEditor';
import CreateNoteDialog from '@/components/notebook/CreateNoteDialog';
import { INote } from '@/services/noteService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Notebook: React.FC = () => {
  const {
    notes,
    folders,
    templates,
    loadingNotes,
    currentFilter,
    currentFilterValue,
    noteTags,
    currentNote,
    setCurrentNote,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  } = useNotebook();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSelectNote = (note: INote) => {
    setCurrentNote(note);
  };

  const handleNewNote = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateNote = async (noteData: {
    title: string;
    content: string;
    folderId?: string;
    templateId?: string;
    tags: string[];
    isFavorite: boolean;
  }) => {
    const newNote = await addNote({
      title: noteData.title,
      content: noteData.content,
      folderId: noteData.folderId,
      templateId: noteData.templateId,
      tags: noteData.tags,
      isFavorite: noteData.isFavorite,
      tradeData: null
    });
    
    if (newNote) {
      setIsCreateDialogOpen(false);
      setCurrentNote(newNote);
    }
  };

  const handleSaveNote = async (noteData: Partial<INote>) => {
    if (!currentNote) return;
    
    try {
      setSaveError(null);
      const updated = await updateNote(currentNote.id, noteData);
      if (!updated) {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveError('Failed to save note. Please try again.');
    }
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavorite(id, isFavorite);
  };

  const getFilterInfo = () => {
    if (currentFilter === 'all') return undefined;
    
    return {
      type: currentFilter,
      value: currentFilterValue
    };
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-80px)] bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Sidebar */}
        <Sidebar onNewNote={handleNewNote} />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Notes list */}
          <div className="md:w-1/2 lg:w-2/5 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <NotesList
              notes={notes}
              loading={loadingNotes}
              onSelectNote={handleSelectNote}
              onToggleFavorite={handleToggleFavorite}
              onDeleteNote={handleDeleteNote}
              onNewNote={handleNewNote}
              filterInfo={getFilterInfo()}
            />
          </div>
          
          {/* Note editor */}
          <div className="md:w-1/2 lg:w-3/5 overflow-y-auto">
            {saveError && (
              <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
            <NoteEditor
              note={currentNote}
              folders={folders}
              tags={noteTags}
              onSave={handleSaveNote}
              onToggleFavorite={handleToggleFavorite}
              onClose={() => setCurrentNote(null)}
            />
          </div>
        </div>
      </div>
      
      {/* Create Note Dialog */}
      <CreateNoteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        folders={folders}
        templates={templates}
        tags={noteTags}
        onCreateNote={handleCreateNote}
      />
    </Layout>
  );
};

export default Notebook;
