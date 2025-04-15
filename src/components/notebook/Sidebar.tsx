
import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  FolderPlus, 
  Star, 
  Clock, 
  Hash, 
  Folder, 
  ChevronDown, 
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotebook } from '@/contexts/NotebookContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SidebarProps {
  onNewNote: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewNote }) => {
  const { 
    folders, 
    noteTags, 
    setFilter, 
    currentFilter, 
    currentFilterValue, 
    addFolder 
  } = useNotebook();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFolders, setShowFolders] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilter('search', searchQuery);
    }
  };

  const handleAddFolder = async () => {
    if (newFolderName.trim()) {
      await addFolder(newFolderName);
      setNewFolderName('');
      setIsAddFolderOpen(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 h-full border-r border-gray-200 dark:border-gray-700 w-64 flex flex-col">
      <div className="p-4">
        <Button onClick={onNewNote} className="w-full mb-4">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
        
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <nav className="space-y-1">
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${currentFilter === 'all' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              onClick={() => setFilter('all')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              All Notes
            </Button>
            
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${currentFilter === 'favorites' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              onClick={() => setFilter('favorites')}
            >
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </Button>
          </nav>

          <Separator className="my-4" />
          
          {/* Folders Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowFolders(!showFolders)}
                className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showFolders ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                Folders
              </button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setIsAddFolderOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            
            {showFolders && (
              <div className="ml-2 space-y-1">
                {folders.length > 0 ? (
                  folders.map(folder => (
                    <Button
                      key={folder.id}
                      variant="ghost"
                      className={`w-full justify-start pl-6 ${
                        currentFilter === 'folder' && currentFilterValue === folder.id 
                          ? 'bg-gray-200 dark:bg-gray-700' 
                          : ''
                      }`}
                      onClick={() => setFilter('folder', folder.id)}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      <span className="truncate">{folder.name}</span>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-1 pl-6">No folders</p>
                )}
              </div>
            )}
          </div>
          
          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowTags(!showTags)}
                className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showTags ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                Tags
              </button>
            </div>
            
            {showTags && (
              <div className="ml-2 space-y-1">
                {noteTags.length > 0 ? (
                  noteTags.map(tag => (
                    <Button
                      key={tag}
                      variant="ghost"
                      className={`w-full justify-start pl-6 ${
                        currentFilter === 'tag' && currentFilterValue === tag 
                          ? 'bg-gray-200 dark:bg-gray-700' 
                          : ''
                      }`}
                      onClick={() => setFilter('tag', tag)}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      <span className="truncate">{tag}</span>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-1 pl-6">No tags</p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="mb-4"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
