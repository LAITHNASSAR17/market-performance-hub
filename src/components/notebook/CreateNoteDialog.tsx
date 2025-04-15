
import React, { useState, useEffect } from 'react';
import { BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import HashtagInput from '@/components/HashtagInput';
import { IFolder, ITemplate } from '@/services/noteService';

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: IFolder[];
  templates: ITemplate[];
  tags: string[];
  onCreateNote: (data: {
    title: string;
    content: string;
    folderId?: string;
    templateId?: string;
    tags: string[];
    isFavorite: boolean;
  }) => void;
}

const CreateNoteDialog: React.FC<CreateNoteDialogProps> = ({
  open,
  onOpenChange,
  folders,
  templates,
  tags,
  onCreateNote
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Apply template when selected
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setContent(template.content);
      }
    }
  }, [templateId, templates]);

  const handleCreateNote = () => {
    if (!title.trim()) return;
    
    onCreateNote({
      title,
      content,
      folderId: folderId || undefined,
      templateId: templateId || undefined,
      tags: noteTags,
      isFavorite
    });
    
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFolderId('');
    setTemplateId('');
    setNoteTags([]);
    setIsFavorite(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Folder
              </label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="No folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Template
              </label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="No template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Blank note</SelectItem>
                  <SelectItem value="_custom">Custom template</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Tags
            </label>
            <HashtagInput
              value={noteTags}
              onChange={setNoteTags}
              suggestions={tags}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Content
            </label>
            <Textarea
              placeholder="Write your note content here..."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateNote} disabled={!title.trim()}>
            <BookText className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;
