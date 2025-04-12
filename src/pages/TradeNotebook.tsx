
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { TradeNote, NoteTemplate, useTradeNotebook } from '@/contexts/TradeNotebookContext';
import { useTrade } from '@/contexts/TradeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Plus, 
  Search, 
  FolderPlus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Tag, 
  FolderKanban,
  ChevronDown, 
  Star, 
  ThumbsUp, 
  Users, 
  FileText,
  LayoutGrid,
  Calendar,
  MoreVertical,
  FileBox,
  ArrowLeft,
  CheckSquare,
  Save,
  Heart
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import HashtagInput from '@/components/HashtagInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const TradeNotebook: React.FC = () => {
  const { notes, folders, templates, addNote, updateNote, deleteNote, addFolder, noteTags } = useTradeNotebook();
  const { trades } = useTrade();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(null);
  const [templateType, setTemplateType] = useState<'favorite' | 'recommended' | 'custom'>('recommended');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tradeId: '',
    folderId: 'trade-notes',
    tags: [] as string[]
  });

  const [folderFormData, setFolderFormData] = useState({
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
    
    const matchesFolder = currentFolderId === 'all' || note.folderId === currentFolderId;
    
    return matchesSearch && matchesFolder;
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

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tradeId: '',
      folderId: 'trade-notes',
      tags: []
    });
  };

  const handleAddNote = () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Title is required",
        description: "Please enter a title for your note",
      });
      return;
    }

    addNote({
      title: formData.title,
      content: formData.content,
      tradeId: formData.tradeId || undefined,
      folderId: formData.folderId,
      tags: formData.tags
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleAddFolder = () => {
    if (!folderFormData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Folder name is required",
        description: "Please enter a name for the folder",
      });
      return;
    }

    addFolder({
      name: folderFormData.name,
      color: folderFormData.color
    });

    setFolderFormData({
      name: '',
      color: '#9c59ff'
    });
    
    setIsAddFolderDialogOpen(false);
  };

  const handleContentChange = (content: string) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { content });
    }
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    
    deleteNote(selectedNoteId);
    setSelectedNoteId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    
    setFormData({
      ...formData,
      title: selectedTemplate.title,
      content: selectedTemplate.content
    });
    
    setIsTemplateDialogOpen(false);
    setIsAddDialogOpen(true);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to get folder by ID
  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left sidebar - Folders */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg flex items-center">
              <FolderKanban className="mr-2 h-5 w-5 text-indigo-500" />
              {t('notebook.tradeNotebook') || 'Trade Notebook'}
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsAddFolderDialogOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="py-2">
              <div className="px-3 py-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Folders</h3>
              </div>
              <div className="space-y-1 px-1">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2 text-sm",
                      currentFolderId === folder.id 
                        ? "bg-indigo-100 dark:bg-indigo-900 font-medium" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    <div 
                      className={cn(
                        "mr-2 h-4 w-1 rounded-full",
                        folder.color ? `bg-[${folder.color}]` : "bg-gray-300"
                      )}
                    />
                    <span className="flex-1 truncate">{folder.name}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {notes.filter(note => note.folderId === folder.id).length}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="px-3 py-2 mt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-1 px-3">
                {noteTags.slice(0, 6).map(tag => (
                  <div 
                    key={tag}
                    className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs"
                  >
                    <span>#{tag}</span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                      {notes.filter(note => note.tags.includes(tag)).length}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 px-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center gap-2"
                  onClick={() => setIsTemplateDialogOpen(true)}
                >
                  <FileBox className="h-4 w-4" />
                  <span>Templates</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Middle section - Notes list */}
        <div className="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{getFolderById(currentFolderId)?.name || 'All Notes'}</h2>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>New note</span>
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="px-2 py-2 space-y-2">
              {sortedNotes.length > 0 ? (
                sortedNotes.map(note => {
                  const hasTradingData = note.tradingData && note.tradingData.netPL !== undefined;
                  const isProfitable = hasTradingData && note.tradingData.netPL > 0;
                  const isBreakEven = hasTradingData && note.tradingData.netPL === 0;
                  const isLoss = hasTradingData && note.tradingData.netPL < 0;
                  
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        "p-3 rounded-md cursor-pointer",
                        selectedNoteId === note.id 
                          ? "bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 shadow-sm" 
                          : "hover:bg-white dark:hover:bg-gray-800 border border-transparent"
                      )}
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <h3 className="font-medium text-sm mb-1">{note.title}</h3>
                      
                      {hasTradingData && (
                        <div className={cn(
                          "text-xs font-medium mb-1",
                          isProfitable ? "text-green-600 dark:text-green-500" : 
                          isLoss ? "text-red-600 dark:text-red-500" : 
                          "text-gray-600 dark:text-gray-400"
                        )}>
                          NET P&L: {formatCurrency(note.tradingData.netPL)}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                      
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag}
                              className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
                            >
                              #{tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{note.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">No notes found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm ? "Try a different search" : "Create your first note"}
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        resetForm();
                        setIsAddDialogOpen(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create new note
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Right section - Note content */}
        <div className="flex-1 bg-white dark:bg-gray-800 flex flex-col">
          {selectedNote ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-lg">{selectedNote.title}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-500">
                      {selectedNote.tradingData && (
                        <div>Net P&L {formatCurrency(selectedNote.tradingData.netPL)}</div>
                      )}
                    </div>
                    
                    {selectedNote.tradingData && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Contracts Traded</div>
                          <div className="font-medium">{selectedNote.tradingData.contractsTraded}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Volume</div>
                          <div className="font-medium">{selectedNote.tradingData.volume}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Commissions</div>
                          <div className="font-medium">{formatCurrency(selectedNote.tradingData.commissions)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Net ROI</div>
                          <div className="font-medium">{selectedNote.tradingData.netROI}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Gross P&L</div>
                          <div className="font-medium">{formatCurrency(selectedNote.tradingData.grossPL)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      View Trade Details
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(selectedNote.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map(tag => (
                      <span 
                        key={tag}
                        className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-300"
                      >
                        #{tag}
                      </span>
                    ))}
                    <Button variant="ghost" size="sm" className="h-5 px-2 text-xs text-gray-500">
                      <Plus className="h-3 w-3 mr-1" />
                      Add tag
                    </Button>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                  {/* Note content rendered here */}
                  <Textarea
                    value={selectedNote.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[300px] font-mono"
                  />
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">No note selected</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Select a note from the list or create a new one
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
                className="mt-6 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create new note
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Record your trading thoughts, strategies, or observations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tradeId">Link to Trade (Optional)</Label>
                <Select
                  value={formData.tradeId}
                  onValueChange={(value) => setFormData({ ...formData, tradeId: value })}
                >
                  <SelectTrigger id="tradeId">
                    <SelectValue placeholder="Select a trade (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {trades.map(trade => (
                      <SelectItem key={trade.id} value={trade.id}>
                        {trade.pair} - {new Date(trade.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="folderId">Save to Folder</Label>
                <Select
                  value={formData.folderId}
                  onValueChange={(value) => setFormData({ ...formData, folderId: value })}
                >
                  <SelectTrigger id="folderId">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.filter(folder => folder.id !== 'all').map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <HashtagInput
                id="tags"
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                suggestions={noteTags}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Folder Dialog */}
      <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your notes by creating custom folders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={folderFormData.name}
                onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="folder-color">Folder Color</Label>
              <div className="flex gap-2 mt-2">
                {['#9c59ff', '#5974ff', '#f5cb42', '#e45fff', '#2dc653', '#ff5959', '#59b6ff'].map(color => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full",
                      folderFormData.color === color ? "ring-2 ring-offset-2 ring-black dark:ring-white" : ""
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFolderFormData({ ...folderFormData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen} className="max-w-4xl">
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Select a notebook template</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-2 border-r pr-4">
              <div className="flex items-center mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-sm text-gray-500">Close & back to notes</span>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates"
                  className="pl-9"
                />
              </div>
              
              <Button variant="outline" className="w-full mb-6">Create new template</Button>
              
              <Tabs defaultValue="recommended" onValueChange={(value) => setTemplateType(value as any)}>
                <TabsContent value="favorite" className="mt-0">
                  <div className="space-y-1 mt-4">
                    {templates.filter(t => t.type === 'favorite').map(template => (
                      <button
                        key={template.id}
                        className={cn(
                          "w-full flex items-center gap-2 text-left py-2 px-3 rounded-md text-sm",
                          selectedTemplate?.id === template.id ? "bg-indigo-100 dark:bg-indigo-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <span>{template.title}</span>
                        {template.emoji && <span>{template.emoji}</span>}
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="recommended" className="mt-0">
                  <div className="space-y-1 mt-4">
                    {templates.filter(t => t.type === 'recommended').map(template => (
                      <button
                        key={template.id}
                        className={cn(
                          "w-full flex items-center gap-2 text-left py-2 px-3 rounded-md text-sm",
                          selectedTemplate?.id === template.id ? "bg-indigo-100 dark:bg-indigo-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <span>{template.title}</span>
                        {template.emoji && <span>{template.emoji}</span>}
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="mt-0">
                  <div className="space-y-1 mt-4">
                    {templates.filter(t => t.type === 'custom').map(template => (
                      <button
                        key={template.id}
                        className={cn(
                          "w-full flex items-center gap-2 text-left py-2 px-3 rounded-md text-sm",
                          selectedTemplate?.id === template.id ? "bg-indigo-100 dark:bg-indigo-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <span>{template.title}</span>
                        {template.emoji && <span>{template.emoji}</span>}
                      </button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsList className="grid w-full grid-cols-3 mt-6">
                  <TabsTrigger value="favorite" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Favourites</span>
                  </TabsTrigger>
                  <TabsTrigger value="recommended" className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Recommended</span>
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>My templates</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="col-span-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedTemplate?.title || "Select a template"}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>Add to favourites</span>
                  </Button>
                  <Button className="flex items-center gap-1" onClick={handleUseTemplate} disabled={!selectedTemplate}>
                    <span>Use template</span>
                  </Button>
                </div>
              </div>
              
              <Card className="border rounded-md">
                <CardContent className="p-6">
                  {selectedTemplate ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {selectedTemplate.content}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto" />
                        <h3 className="mt-2 text-lg font-medium">Select a template</h3>
                        <p className="text-sm text-gray-500">
                          Choose a template from the left sidebar to preview
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this note.
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

export default TradeNotebook;
