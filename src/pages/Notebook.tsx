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
import { useToast } from '@/hooks/use-toast';
import { 
  Folder, File, Plus, Edit, Trash2, Tag, ChevronDown, MoreVertical, 
  Search, Star, Clock, Bookmark, ThumbsUp, Palette, FileText, 
  ArrowLeft, Check, Info, FolderPlus, Hash, BookOpen, PenLine, 
  FileText as FileTextIcon, RotateCcw, ChevronRight, History,
  Star as StarIcon, CircleCheck, Eye, Copy, RefreshCcw, PlusSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types
interface Note {
  id: string;
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
  
  // State
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

  // Get the selected note
  const selectedNote = selectedNoteId ? notes.find(note => note.id === selectedNoteId) : null;
  
  // Filter notes based on current folder and search term
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFolder = selectedFolderId === 'all' || note.folderId === selectedFolderId;
    const matchesTag = !selectedTagId || note.tags.includes(selectedTagId);
    
    return matchesSearch && matchesFolder && matchesTag;
  });

  // Sort notes by updated date (newest first)
  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Filter templates based on type
  const filteredTemplates = templates.filter(template => 
    templateType === 'favorite' ? template.type === 'favorite' : 
    templateType === 'recommended' ? template.type === 'recommended' : 
    template.type === 'custom'
  );

  useEffect(() => {
    // Select the first note by default if available
    if (sortedNotes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(sortedNotes[0].id);
    }
  }, [sortedNotes, selectedNoteId]);

  // Load data from MySQL or fetch sample data
  useEffect(() => {
    // For now, we'll load sample data
    // In a real implementation, we would fetch from MySQL
    loadSampleData();
    
    // If connected to MySQL, fetch data
    if (mysql.connectionStatus === 'connected') {
      fetchDataFromMySQL();
    }
  }, [mysql.connectionStatus]);

  const loadSampleData = () => {
    // Load sample folders, notes, tags, and templates
    // The initial state is already populated with sample data
  };

  const fetchDataFromMySQL = async () => {
    try {
      // Fetch folders
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
      
      // Fetch notes
      const notesResult = await mysql.getNotes(undefined, user?.id);
      if (notesResult.length > 0) {
        setNotes(notesResult.map((note: any) => ({
          id: note.id.toString(),
          title: note.title,
          content: note.content,
          folderId: note.folderId.toString(),
          tags: note.tags || [],
          tradeId: note.tradeId ? note.tradeId.toString() : undefined,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        })));
      }
      
      // Fetch tags
      const tagsResult = await mysql.getTags(user?.id);
      if (tagsResult.length > 0) {
        setTags(tagsResult.map((tag: any) => ({
          id: tag.id.toString(),
          name: tag.name,
          count: tag.noteCount || 0
        })));
      }
      
      // Fetch templates
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
      createdAt: now,
      updatedAt: now
    };

    setNotes([...notes, newNoteWithId]);
    setSelectedNoteId(newNoteWithId.id);
    setIsAddDialogOpen(false);
    
    // Reset new note form
    setNewNote({
      title: '',
      content: '',
      folderId: selectedFolderId !== 'all' ? selectedFolderId : 'trade-notes',
      tags: []
    });
    
    // If connected to MySQL, save to database
    if (mysql.connectionStatus === 'connected') {
      mysql.createNote({
        title: newNote.title,
        content: newNote.content,
        folderId: newNote.folderId,
        userId: user?.id,
        tradeId: newNote.tradeId,
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
    
    // Reset new folder form
    setNewFolder({
      name: '',
      color: '#9c59ff'
    });
    
    // If connected to MySQL, save to database
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
    
    // Select the first note after deletion
    if (sortedNotes.length > 1) {
      const index = sortedNotes.findIndex(note => note.id === selectedNoteId);
      const nextNote = sortedNotes[index + 1] || sortedNotes[index - 1];
      setSelectedNoteId(nextNote ? nextNote.id : null);
    } else {
      setSelectedNoteId(null);
    }
    
    setIsDeleteDialogOpen(false);
    
    // If connected to MySQL, delete from database
    if (mysql.connectionStatus === 'connected') {
      mysql.deleteNote(parseInt(selectedNoteId, 10)).catch(error => {
        console.error("Error deleting note from MySQL:", error);
        toast({
          title: "Delete Error",
          description: "Failed to delete note from database",
          variant: "destructive"
        });
      });
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
    
    // If connected to MySQL, update in database
    if (mysql.connectionStatus === 'connected') {
      mysql.updateNote(parseInt(selectedNoteId, 10), { content }).catch(error => {
        console.error("Error updating note in MySQL:", error);
        toast({
          title: "Save Error",
          description: "Failed to save note to database",
          variant: "destructive"
        });
      });
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
    
    // If connected to MySQL, update in database
    if (mysql.connectionStatus === 'connected') {
      mysql.updateNote(parseInt(selectedNoteId, 10), { title }).catch(error => {
        console.error("Error updating note in MySQL:", error);
        toast({
          title: "Save Error",
          description: "Failed to save note to database",
          variant: "destructive"
        });
      });
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
    
    // Update tag counts and ensure all tags exist
    const tagMap = new Map<string, number>();
    
    tags.forEach(tagName => {
      // Check if tag already exists in the tags array
      if (!tags.some(t => t === tagName)) {
        // Add new tag as a Tag object, not just a string
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
    
    // If connected to MySQL, update in database
    if (mysql.connectionStatus === 'connected') {
      mysql.updateNote(parseInt(selectedNoteId, 10), { tags }).catch(error => {
        console.error("Error updating note tags in MySQL:", error);
        toast({
          title: "Save Error",
          description: "Failed to save tags to database",
          variant: "destructive"
        });
      });
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
    
    // If connected to MySQL, update in database
    if (mysql.connectionStatus === 'connected') {
      mysql.updateTemplate(parseInt(template.id, 10), { type: 'favorite' }).catch(error => {
        console.error("Error updating template in MySQL:", error);
        toast({
          title: "Save Error",
          description: "Failed to save template to database",
          variant: "destructive"
        });
      });
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
                  // Get trade information if this note is linked to a trade
                  const linkedTrade = note.tradeId 
                    ? trades.find(t => t.id === note.tradeId)
                    : undefined;
                  
                  // Determine if this note has P&L info
                  const hasPL = note.tradingData?.netPL !== undefined || 
                                (linkedTrade && linkedTrade.profitLoss !== undefined);
                  
                  // Get P&L value
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
                        </TooltipTrigger
