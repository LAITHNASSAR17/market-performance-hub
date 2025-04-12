import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { useMySQL } from '@/contexts/MySQLContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTrade } from '@/contexts/TradeContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import HashtagInput from '@/components/HashtagInput';
import { useToast } from '@/components/ui/use-toast';
import { 
  Folder, File, Plus, Edit, Trash2, Tag, ChevronDown, MoreVertical, 
  Search, Star, Clock, Bookmark, ThumbsUp, Palette, FileText, 
  ArrowLeft, Check, Info, FolderPlus, Hash, BookOpen, PenLine, 
  FileText as FileTextIcon, RotateCcw, ChevronRight, History,
  Star as StarIcon, CircleCheck, Eye, Copy, RefreshCcw, PlusSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  folderId: string;
  tags: string[];
  tradeId?: string;
  createdAt: string;
  updatedAt: string;
  tradingData?: {
    netPL: number;
    contractsTraded: number;
    volume: number;
    commissions: number;
    netROI: number;
    grossPL: number;
  };
}

interface Folder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface Template {
  id: string;
  title: string;
  content: string;
  type: 'favorite' | 'recommended' | 'custom';
  emoji?: string;
}

interface Tag {
  id: string;
  name: string;
  count: number;
}

const Notebook = () => {
  const { user } = useAuth();
  const { trades } = useTrade();
  const { toast } = useToast();
  const mysql = useMySQL();
  
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'all', name: 'All notes' },
    { id: 'trade-notes', name: 'Trade Notes', color: '#9c59ff' },
    { id: 'daily-journal', name: 'Daily Journal', color: '#5974ff' },
    { id: 'sessions-recap', name: 'Sessions Recap', color: '#5974ff' },
    { id: 'quarterly-goals', name: 'Quarterly Goals 📊', color: '#f5cb42' },
    { id: 'trading-plan', name: 'Trading Plan 📝', color: '#e45fff' },
    { id: '2023-goals', name: '2023 Goals + Plan 📌', color: '#4269ff' },
    { id: 'plan-of-action', name: 'Plan of Action📝', color: '#2dc653' },
    { id: 'templates', name: 'Templates', color: '#c5d3e8' },
    { id: 'recently-deleted', name: 'Recently Deleted', color: '#ff6b6b' }
  ]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [templateType, setTemplateType] = useState<'favorite' | 'recommended' | 'custom'>('favorite');
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTradeDetailsDialogOpen, setIsTradeDetailsDialogOpen] = useState(false);
  
  const [newNote, setNewNote] = useState<{
    title: string;
    content: string;
    folderId: string;
    tags: string[];
    tradeId?: string;
  }>({
    title: '',
    content: '',
    folderId: selectedFolderId !== 'all' ? selectedFolderId : 'trade-notes',
    tags: []
  });
  
  const [newFolder, setNewFolder] = useState<{
    name: string;
    color: string;
  }>({
    name: '',
    color: '#9c59ff'
  });

  const selectedNote = selectedNoteId ? notes.find(note => note.id === selectedNoteId) : null;
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFolder = selectedFolderId === 'all' || note.folderId === selectedFolderId;
    const matchesTag = !selectedTagId || note.tags.includes(selectedTagId);
    
    return matchesSearch && matchesFolder && matchesTag;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const filteredTemplates = templates.filter(template => 
    templateType === 'favorite' ? template.type === 'favorite' : 
    templateType === 'recommended' ? template.type === 'recommended' : 
    template.type === 'custom'
  );

  useEffect(() => {
    if (sortedNotes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(sortedNotes[0].id);
    }
  }, [sortedNotes, selectedNoteId]);

  useEffect(() => {
    loadSampleData();
    
    if (mysql.connectionStatus === 'connected') {
      fetchDataFromMySQL();
    }
  }, [mysql.connectionStatus]);

  const loadSampleData = () => {
    // Load sample data
  };

  const fetchDataFromMySQL = async () => {
    try {
      const foldersResult = await mysql.getFolders(user?.id);
      if (foldersResult.length > 0) {
        setFolders([
          { id: 'all', name: 'All notes' },
          ...foldersResult.map((folder: any) => ({
            id: folder.id.toString(),
            name: folder.name,
            color: folder.color
          })),
          { id: 'recently-deleted', name: 'Recently Deleted', color: '#ff6b6b' }
        ]);
      }
      
      const notesResult = await mysql.getNotes(undefined, user?.id);
      if (notesResult.length > 0) {
        setNotes(notesResult.map((note: any) => ({
          id: note.id.toString(),
          userId: note.userId?.toString() || user?.id || '1',
          title: note.title,
          content: note.content,
          folderId: note.folderId.toString(),
          tags: note.tags || [],
          tradeId: note.tradeId ? note.tradeId.toString() : undefined,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        })));
      }
      
      const tagsResult = await mysql.getTags(user?.id);
      if (tagsResult.length > 0) {
        setTags(tagsResult.map((tag: any) => ({
          id: tag.id.toString(),
          name: tag.name,
          count: tag.noteCount || 0
        })));
      }
      
      const templatesResult = await mysql.getTemplates(user?.id);
      if (templatesResult.length > 0) {
        setTemplates(templatesResult.map((template: any) => ({
          id: template.id.toString(),
          title: template.title,
          content: template.content,
          type: template.type as 'favorite' | 'recommended' | 'custom',
          emoji: template.emoji
        })));
      }
    } catch (error) {
      console.error("Error fetching data from MySQL:", error);
      toast({
        title: "Data Loading Error",
        description: "Could not load data from the database. Using sample data instead.",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    const newNoteWithId: Note = {
      ...newNote,
      id: Date.now().toString(),
      userId: user?.id || '1',
      createdAt: now,
      updatedAt: now
    };

    setNotes([...notes, newNoteWithId]);
    setSelectedNoteId(newNoteWithId.id);
    setIsAddDialogOpen(false);
    
    setNewNote({
      title: '',
      content: '',
      folderId: selectedFolderId !== 'all' ? selectedFolderId : 'trade-notes',
      tags: []
    });
    
    if (mysql.connectionStatus === 'connected') {
      mysql.createNote({
        title: newNote.title,
        content: newNote.content,
        folderId: parseInt(newNote.folderId, 10),
        userId: user?.id,
        tradeId: newNote.tradeId ? parseInt(newNote.tradeId, 10) : undefined,
        tags: newNote.tags
      }).catch(error => {
        console.error("Error creating note in MySQL:", error);
        toast({
          title: "Save Error",
          description: "Failed to save note to database",
          variant: "destructive"
        });
      });
    }

    toast({
      title: "Note Added",
      description: "Your note has been created"
    });
  };

  const handleAddFolder = () => {
    if (!newFolder.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your folder",
        variant: "destructive"
      });
      return;
    }

    const newFolderWithId: Folder = {
      ...newFolder,
      id: Date.now().toString()
    };

    setFolders([...folders.filter(f => f.id !== 'recently-deleted'), newFolderWithId, folders.find(f => f.id === 'recently-deleted')!]);
    setSelectedFolderId(newFolderWithId.id);
    setIsAddFolderDialogOpen(false);
    
    setNewFolder({
      name: '',
      color: '#9c59ff'
    });
    
    if (mysql.connectionStatus === 'connected') {
      mysql.createFolder(newFolder.name, newFolder.color, user?.id).catch(error => {
        console.error("Error creating folder in MySQL:", error);
        toast({
          title: "Save Error",
          description: "Failed to save folder to database",
          variant: "destructive"
        });
      });
    }

    toast({
      title: "Folder Added",
      description: "Your folder has been created"
    });
  };
  
  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    
    setNotes(notes.filter(note => note.id !== selectedNoteId));
    
    if (sortedNotes.length > 1) {
      const index = sortedNotes.findIndex(note => note.id === selectedNoteId);
      const nextNote = sortedNotes[index + 1] || sortedNotes[index - 1];
      setSelectedNoteId(nextNote ? nextNote.id : null);
    } else {
      setSelectedNoteId(null);
    }
    
    setIsDeleteDialogOpen(false);
    
    if (mysql.connectionStatus === 'connected' && selectedNoteId) {
      // Convert string ID to number and ensure it's valid
      const noteId = parseInt(selectedNoteId, 10);
      if (!isNaN(noteId)) {
        mysql.deleteNote(noteId).catch(error => {
          console.error("Error deleting note from MySQL:", error);
          toast({
            title: "Delete Error",
            description: "Failed to delete note from database",
            variant: "destructive"
          });
        });
      }
    }

    toast({
      title: "Note Deleted",
      description: "Your note has been deleted"
    });
  };
  
  const handleContentChange = (content: string) => {
    if (!selectedNoteId) return;
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNoteId 
        ? { ...note, content, updatedAt: new Date().toISOString() } 
        : note
    );
    
    setNotes(updatedNotes);
    
    if (mysql.connectionStatus === 'connected' && selectedNoteId) {
      // Convert string ID to number and ensure it's valid
      const noteId = parseInt(selectedNoteId, 10);
      if (!isNaN(noteId)) {
        mysql.updateNote(noteId, { content }).catch(error => {
          console.error("Error updating note in MySQL:", error);
          toast({
            title: "Save Error",
            description: "Failed to save note to database",
            variant: "destructive"
          });
        });
      }
    }
  };
  
  const handleTitleChange = (title: string) => {
    if (!selectedNoteId) return;
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNoteId 
        ? { ...note, title, updatedAt: new Date().toISOString() } 
        : note
    );
    
    setNotes(updatedNotes);
    
    if (mysql.connectionStatus === 'connected' && selectedNoteId) {
      // Convert string ID to number and ensure it's valid
      const noteId = parseInt(selectedNoteId, 10);
      if (!isNaN(noteId)) {
        mysql.updateNote(noteId, { title }).catch(error => {
          console.error("Error updating note in MySQL:", error);
          toast({
            title: "Save Error",
            description: "Failed to save note to database",
            variant: "destructive"
          });
        });
      }
    }
  };
  
  const handleTagsChange = (tags: string[]) => {
    if (!selectedNoteId) return;
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNoteId 
        ? { ...note, tags, updatedAt: new Date().toISOString() } 
        : note
    );
    
    setNotes(updatedNotes);
    
    const tagMap = new Map<string, number>();
    
    tags.forEach(tagName => {
      if (!tags.some(t => t === tagName)) {
        setTags(prevTags => [...prevTags, { 
          id: Date.now().toString(), 
          name: tagName, 
          count: 1 
        }]);
      } else {
        const existingTag = tags.find(t => t === tagName);
        if (existingTag) {
          tagMap.set(existingTag, (tagMap.get(existingTag) || 0) + 1);
        }
      }
    });
    
    if (mysql.connectionStatus === 'connected' && selectedNoteId) {
      // Convert string ID to number and ensure it's valid
      const noteId = parseInt(selectedNoteId, 10);
      if (!isNaN(noteId)) {
        mysql.updateNote(noteId, { tags }).catch(error => {
          console.error("Error updating note tags in MySQL:", error);
          toast({
            title: "Save Error",
            description: "Failed to save tags to database",
            variant: "destructive"
          });
        });
      }
    }
  };
  
  const handleUseTemplate = (template: Template) => {
    setNewNote({
      ...newNote,
      content: template.content
    });
    
    setIsTemplateDialogOpen(false);
    setIsAddDialogOpen(true);
  };
  
  const handleAddFavorite = (template: Template) => {
    if (template.type === 'favorite') return;
    
    const updatedTemplates = templates.map(t => 
      t.id === template.id ? { ...t, type: 'favorite' as const } : t
    );
    
    setTemplates(updatedTemplates);
    
    if (mysql.connectionStatus === 'connected' && template.id) {
      // Convert string ID to number and ensure it's valid
      const templateId = parseInt(template.id, 10);
      if (!isNaN(templateId)) {
        mysql.updateTemplate(templateId, { type: 'favorite' }).catch(error => {
          console.error("Error updating template in MySQL:", error);
          toast({
            title: "Save Error",
            description: "Failed to save template to database",
            variant: "destructive"
          });
        });
      }
    }
    
    toast({
      title: "Added to Favorites",
      description: `"${template.title}" has been added to your favorites`
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
              Notebook
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddFolderDialogOpen(true)}>
                    <FolderPlus className="h-5 w-5 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="px-3 py-2">
              <Collapsible
                open={isFoldersOpen}
                onOpenChange={setIsFoldersOpen}
                className="space-y-2"
              >
                <div className="flex items-center justify-between py-1">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      <ChevronRight className={cn("h-4 w-4 transition-transform", isFoldersOpen ? "rotate-90" : "")} />
                      <span className="font-medium">Folders</span>
                    </div>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-1">
                  {folders.filter(folder => folder.id !== 'recently-deleted').map((folder) => (
                    <div
                      key={folder.id}
                      className={cn(
                        "flex items-center justify-between py-1 px-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group",
                        selectedFolderId === folder.id ? "bg-gray-100 dark:bg-gray-700" : ""
                      )}
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setSelectedTagId(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {folder.id === 'all' ? (
                          <FileText className="h-4 w-4 text-blue-500" />
                        ) : (
                          <div 
                            className="h-4 w-1 rounded-sm"
                            style={{ backgroundColor: folder.color || '#9c59ff' }}
                          />
                        )}
                        <span className="text-sm truncate">
                          {folder.name}
                        </span>
                      </div>
                      
                      {folder.id !== 'all' && (
                        <div className="opacity-0 group-hover:opacity-100">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Folder options</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div
                    className={cn(
                      "flex items-center justify-between py-1 px-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group mt-2",
                      selectedFolderId === 'recently-deleted' ? "bg-gray-100 dark:bg-gray-700" : ""
                    )}
                    onClick={() => {
                      setSelectedFolderId('recently-deleted');
                      setSelectedTagId(null);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="text-sm truncate">
                        Recently Deleted
                      </span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible
                open={isTagsOpen}
                onOpenChange={setIsTagsOpen}
                className="space-y-2 mt-4"
              >
                <div className="flex items-center justify-between py-1">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      <ChevronRight className={cn("h-4 w-4 transition-transform", isTagsOpen ? "rotate-90" : "")} />
                      <span className="font-medium">Tags</span>
                    </div>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-1">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className={cn(
                          "flex items-center gap-1 py-1 px-2 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer",
                          selectedTagId === tag.id ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" : ""
                        )}
                        onClick={() => {
                          setSelectedTagId(selectedTagId === tag.id ? null : tag.id);
                          if (selectedTagId !== tag.id) {
                            setSelectedFolderId('all');
                          }
                        }}
                      >
                        <Hash className="h-3 w-3" />
                        <span>{tag.name}</span>
                        {tag.count > 0 && (
                          <span className="ml-1 bg-gray-200 dark:bg-gray-600 px-1 rounded-full">
                            {tag.count}
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {tags.length === 0 && (
                      <p className="text-xs text-gray-500 italic px-1">
                        No tags yet. Add tags to your notes.
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </div>
        
        <div className="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">
                {selectedFolderId === 'all' 
                  ? 'All notes' 
                  : getFolderById(selectedFolderId)?.name || 'Notes'}
              </h3>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setIsAddDialogOpen(true);
                          setNewNote({
                            ...newNote,
                            folderId: selectedFolderId !== 'all' ? selectedFolderId : 'trade-notes'
                          });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add new note</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>More options</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {sortedNotes.length > 0 ? (
                sortedNotes.map((note) => {
                  const linkedTrade = note.tradeId 
                    ? trades.find(t => t.id === note.tradeId)
                    : undefined;
                  
                  const hasPL = note.tradingData?.netPL !== undefined || 
                                (linkedTrade && linkedTrade.profitLoss !== undefined);
                  
                  const pl = note.tradingData?.netPL !== undefined 
                    ? note.tradingData.netPL
                    : (linkedTrade && linkedTrade.profitLoss !== undefined)
                    ? parseFloat(linkedTrade.profitLoss.toString())
                    : 0;
                  
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        "p-3 mb-2 rounded-md cursor-pointer border border-transparent",
                        selectedNoteId === note.id
                          ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                          : "hover:bg-white dark:hover:bg-gray-800"
                      )}
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <h4 className="font-medium text-sm mb-1 truncate">{note.title}</h4>
                      
                      {hasPL && (
                        <div className={cn(
                          "text-xs font-medium mb-1",
                          pl > 0 ? "text-green-600" : pl < 0 ? "text-red-600" : "text-gray-600"
                        )}>
                          NET P&L: {pl > 0 ? '+' : ''}{formatCurrency(pl)}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                      
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span 
                              key={tag}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                            >
                              <Hash className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-40 p-4">
                  <FileTextIcon className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    {searchTerm
                      ? "No notes found matching your search"
                      : selectedTagId
                      ? "No notes with this tag"
                      : selectedFolderId === 'recently-deleted'
                      ? "No deleted notes"
                      : "No notes in this folder yet"}
                  </p>
                  {!searchTerm && !selectedTagId && selectedFolderId !== 'recently-deleted' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setIsAddDialogOpen(true);
                        setNewNote({
                          ...newNote,
                          folderId: selectedFolderId !== 'all' ? selectedFolderId : 'trade-notes'
                        });
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add your first note
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-800 flex flex-col">
          {selectedNote ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedNote.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-transparent border-none font-bold text-xl focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5"
                    />
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <span>Created: {new Date(selectedNote.createdAt).toLocaleString()}</span>
                      <span className="mx-1">•</span>
                      <span>Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete this note</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>More options</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="mt-2">
                  <HashtagInput
                    value={selectedNote.tags}
                    onChange={handleTagsChange}
                    suggestions={tags.map(tag => tag.name)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-auto">
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-full border-none focus-visible:ring-0 resize-none bg-transparent"
                  placeholder="Write your note content here..."
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FileTextIcon className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                No note selected
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                Select a note from the sidebar or create a new one to start writing.
              </p>
              <Button
                onClick={() => {
                  setIsAddDialogOpen(true);
                  setNewNote({
                    ...newNote,
                    folderId: selectedFolderId !== 'all' ? selectedFolderId : 'trade-notes'
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Note
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new note to your notebook. You can choose a folder and add tags.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={newNote.folderId}
                onValueChange={(value) => setNewNote({ ...newNote, folderId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {folders.filter(folder => folder.id !== 'all' && folder.id !== 'recently-deleted').map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tags">Tags</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7"
                  onClick={() => setIsTemplateDialogOpen(true)}
                >
                  <StarIcon className="h-3.5 w-3.5 text-amber-500 mr-1" />
                  Use Template
                </Button>
              </div>
              <HashtagInput
                id="tags"
                value={newNote.tags}
                onChange={(tags) => setNewNote({ ...newNote, tags })}
                suggestions={tags.map(tag => tag.name)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note content here..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Add a new folder to organize your notes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="Enter folder name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Folder Color</Label>
              <div className="flex flex-wrap gap-2">
                {['#9c59ff', '#5974ff', '#4269ff', '#f5cb42', '#e45fff', '#2dc653', '#ff6b6b', '#ff9800', '#00bcd4'].map((color) => (
                  <div
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer border-2",
                      newFolder.color === color ? "border-gray-900 dark:border-white" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewFolder({ ...newFolder, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Select a template to use for your note.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-4 py-2">
            <Button
              variant={templateType === 'favorite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateType('favorite')}
            >
              <StarIcon className="h-4 w-4 mr-2 text-amber-500" />
              Favorites
            </Button>
            <Button
              variant={templateType === 'recommended' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateType('recommended')}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Recommended
            </Button>
            <Button
              variant={templateType === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateType('custom')}
            >
              <PenLine className="h-4 w-4 mr-2" />
              My Templates
            </Button>
          </div>
          
          <ScrollArea className="h-[400px] border rounded-md">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-md p-4 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">
                        {template.emoji && <span className="mr-2">{template.emoji}</span>}
                        {template.title}
                      </h4>
                      <div className="flex items-center">
                        {template.type !== 'favorite' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddFavorite(template);
                                  }}
                                >
                                  <Star className="h-3.5 w-3.5 text-gray-400 hover:text-amber-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Add to favorites</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-3 whitespace-pre-line">
                      {template.content.substring(0, 150)}
                      {template.content.length > 150 && '...'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-8">
                  <FileTextIcon className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    {templateType === 'favorite' 
                      ? "No favorite templates yet. Mark templates as favorites to see them here."
                      : templateType === 'recommended'
                      ? "No recommended templates available."
                      : "You haven't created any custom templates yet."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Notebook;
