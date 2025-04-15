
import React from 'react';
import { FilePlus } from 'lucide-react';
import { INote } from '@/services/noteService';
import NoteCard from './NoteCard';
import EmptyState from './EmptyState';
import { Button } from '@/components/ui/button';

interface NotesListProps {
  notes: INote[];
  loading: boolean;
  onSelectNote: (note: INote) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onDeleteNote: (id: string) => void;
  onNewNote: () => void;
  filterInfo?: {
    type: string;
    value?: string;
  };
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  loading,
  onSelectNote,
  onToggleFavorite,
  onDeleteNote,
  onNewNote,
  filterInfo
}) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 h-48">
              <div className="p-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    let title = 'No notes found';
    let description = 'You haven\'t created any notes yet.';

    if (filterInfo) {
      if (filterInfo.type === 'folder') {
        title = 'No notes in this folder';
        description = 'This folder doesn\'t have any notes yet.';
      } else if (filterInfo.type === 'tag') {
        title = `No notes with tag #${filterInfo.value}`;
        description = 'There are no notes with this tag.';
      } else if (filterInfo.type === 'favorites') {
        title = 'No favorite notes';
        description = 'You haven\'t marked any notes as favorites.';
      } else if (filterInfo.type === 'search') {
        title = 'No matching notes';
        description = `No notes found matching "${filterInfo.value}".`;
      }
    }

    return (
      <div className="p-4">
        <EmptyState
          title={title}
          description={description}
          icon="note"
          actionLabel="Create new note"
          onAction={onNewNote}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </h2>
        <Button size="sm" onClick={onNewNote}>
          <FilePlus className="h-4 w-4 mr-2" />
          New note
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onSelect={onSelectNote}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesList;
