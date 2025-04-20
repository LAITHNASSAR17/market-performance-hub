
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useNotebook, Note } from '@/contexts/NotebookContext';
import { useTrade } from '@/contexts/TradeContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogFooter, Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit2, Trash2, BookOpen, Tag, BookText, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import HashtagInput from '@/components/HashtagInput';
import { cn } from '@/lib/utils';

const Notebook: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, noteTags, loading, error, refreshNotes } = useNotebook();
  const { trades } = useTrade();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tradeId: '',
    tags: [] as string[]
  });

  // Apply filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = tagFilter === 'all' || note.tags.includes(tagFilter);
    
    return matchesSearch && matchesTag;
  });

  // Sort notes by updated date (newest first)
  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tradeId: '',
      tags: []
    });
  };

  const handleAddNote = () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "العنوان مطلوب",
        description: "الرجاء إدخال عنوان للملاحظة",
      });
      return;
    }

    addNote({
      title: formData.title,
      content: formData.content,
      tradeId: formData.tradeId || undefined,
      tags: formData.tags
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content,
      tradeId: note.tradeId || '',
      tags: note.tags
    });
    setCurrentNoteId(note.id);
    setIsEditDialogOpen(true);
  };

  const handleEditNote = () => {
    if (!currentNoteId) return;

    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "العنوان مطلوب",
        description: "الرجاء إدخال عنوان للملاحظة",
      });
      return;
    }

    updateNote(currentNoteId, {
      title: formData.title,
      content: formData.content,
      tradeId: formData.tradeId || undefined,
      tags: formData.tags
    });

    resetForm();
    setCurrentNoteId(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (noteId: string) => {
    setCurrentNoteId(noteId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteNote = () => {
    if (!currentNoteId) return;
    deleteNote(currentNoteId);
    setCurrentNoteId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotes();
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملاحظات بنجاح",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحديث الملاحظات",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة المحاولة
              </>
            )}
          </Button>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="h-16 w-16 text-blue-500 mb-4 animate-spin" />
          <h2 className="text-xl font-bold mb-2">جاري التحميل...</h2>
          <p className="text-gray-600">يرجى الانتظار بينما نقوم بتحميل الملاحظات</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Notebook</h1>
          <p className="text-gray-500">Your trading notes and observations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="mr-2">
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {noteTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setTagFilter('all');
          }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Notes List */}
      {sortedNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map(note => {
            const linkedTrade = note.tradeId 
              ? trades.find(trade => trade.id === note.tradeId) 
              : undefined;
              
            return (
              <Card key={note.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(note)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(note.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(note.updatedAt).toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="max-h-32 overflow-hidden text-ellipsis">
                    {note.content.split('\n').map((paragraph, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {note.content.length > 200 && (
                    <div className="text-xs text-right mt-2 text-muted-foreground">
                      [Content truncated]
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-0">
                  {linkedTrade && (
                    <div className="flex items-center text-xs mb-2 text-blue-600">
                      <BookText className="h-3 w-3 mr-1" />
                      <span>Linked to trade: {linkedTrade.pair} ({new Date(linkedTrade.date).toLocaleDateString()})</span>
                    </div>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <BookOpen className="mx-auto h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No notes found</h3>
          <p className="text-gray-500 mb-6">
            {notes.length > 0 
              ? "Try changing your filters or search term"
              : "Start by adding your first note"}
          </p>
          {notes.length === 0 && (
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Note
            </Button>
          )}
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
            <DialogDescription>
              Record your trading thoughts, strategies, or reminders
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
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
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
                  <SelectItem value="">None</SelectItem>
                  {trades.map(trade => (
                    <SelectItem key={trade.id} value={trade.id}>
                      {trade.pair} - {new Date(trade.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Write your note here..."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-tradeId">Link to Trade (Optional)</Label>
              <Select
                value={formData.tradeId}
                onValueChange={(value) => setFormData({ ...formData, tradeId: value })}
              >
                <SelectTrigger id="edit-tradeId">
                  <SelectValue placeholder="Select a trade (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {trades.map(trade => (
                    <SelectItem key={trade.id} value={trade.id}>
                      {trade.pair} - {new Date(trade.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <HashtagInput
                id="edit-tags"
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                suggestions={noteTags}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNote}>Update Note</Button>
          </DialogFooter>
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

export default Notebook;
