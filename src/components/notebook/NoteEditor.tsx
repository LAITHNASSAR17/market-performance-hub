
import React, { useState, useEffect } from 'react';
import { Save, Star, StarOff, X, Folder, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { INote, IFolder } from '@/services/noteService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HashtagInput from '@/components/HashtagInput';

interface NoteEditorProps {
  note: INote | null;
  folders: IFolder[];
  tags: string[];
  onSave: (note: Partial<INote>) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  folders,
  tags,
  onSave,
  onToggleFavorite,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setFolderId(note.folderId);
      setNoteTags(note.tags || []);
      setIsFavorite(note.isFavorite || false);
      setIsDirty(false);
    }
  }, [note]);

  const handleSave = () => {
    if (!note) return;
    
    onSave({
      title,
      content,
      folderId,
      tags: noteTags,
      isFavorite
    });
    
    setIsDirty(false);
  };

  const handleChange = () => {
    setIsDirty(true);
  };

  const handleToggleFavorite = () => {
    if (!note) return;
    
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onToggleFavorite(note.id, newFavoriteState);
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Select a note to view or edit
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={!isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <Star className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            handleChange();
          }}
          className="text-lg font-medium mb-3"
        />
        
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center mb-1">
              <Folder className="h-4 w-4 mr-1" />
              <span className="text-sm">Folder</span>
            </div>
            <Select 
              value={folderId} 
              onValueChange={(value) => {
                setFolderId(value || undefined);
                handleChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="No folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center mb-1">
              <Tag className="h-4 w-4 mr-1" />
              <span className="text-sm">Tags</span>
            </div>
            <HashtagInput
              value={noteTags}
              onChange={(newTags) => {
                setNoteTags(newTags);
                handleChange();
              }}
              suggestions={tags}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <Textarea
          placeholder="Write your note content here..."
          className="min-h-[300px] h-full resize-none font-mono"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleChange();
          }}
        />
      </div>
    </div>
  );
};

export default NoteEditor;
