
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
import { useToast } from '@/hooks/use-toast';
import HashtagInput from '@/components/HashtagInput';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [refreshing, setRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tradeId: '',
    tags: [] as string[]
  });

  // تطبيق الفلاتر
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = tagFilter === 'all' || note.tags.includes(tagFilter);
    
    return matchesSearch && matchesTag;
  });

  // ترتيب الملاحظات حسب تاريخ التحديث (الأحدث أولاً)
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
    setRefreshing(true);
    try {
      await refreshNotes();
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملاحظات بنجاح",
      });
    } catch (error) {
      console.error('Failed to refresh notes:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث الملاحظات",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">المفكرة</h1>
          <p className="text-gray-500">ملاحظات وملاحظات التداول الخاصة بك</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة ملاحظة
          </Button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`ml-2 h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* الفلاتر */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في الملاحظات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="جميع العلامات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع العلامات</SelectItem>
              {noteTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setTagFilter('all');
          }}>
            مسح الفلاتر
          </Button>
        </div>
      </div>

      {/* قائمة الملاحظات */}
      {loading ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
          <h3 className="text-lg font-medium text-gray-600">جاري تحميل الملاحظات...</h3>
        </div>
      ) : sortedNotes.length > 0 ? (
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
                      [المحتوى مختصر]
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-0">
                  {linkedTrade && (
                    <div className="flex items-center text-xs mb-2 text-blue-600">
                      <BookText className="h-3 w-3 ml-1" />
                      <span>مرتبط بتداول: {linkedTrade.pair} ({new Date(linkedTrade.date).toLocaleDateString()})</span>
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
          <h3 className="text-lg font-medium text-gray-600 mb-2">لم يتم العثور على ملاحظات</h3>
          <p className="text-gray-500 mb-6">
            {notes.length > 0 
              ? "حاول تغيير عوامل التصفية أو مصطلح البحث"
              : "ابدأ بإضافة ملاحظتك الأولى"}
          </p>
          {notes.length === 0 && (
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="ml-2 h-4 w-4" />
              أضف ملاحظتك الأولى
            </Button>
          )}
        </div>
      )}

      {/* إضافة ملاحظة جديدة */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
            <DialogDescription>
              سجل أفكار التداول أو الاستراتيجيات أو التذكيرات
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                placeholder="عنوان الملاحظة"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">المحتوى</Label>
              <Textarea
                id="content"
                placeholder="اكتب ملاحظتك هنا..."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tradeId">ربط بتداول (اختياري)</Label>
              <Select
                value={formData.tradeId}
                onValueChange={(value) => setFormData({ ...formData, tradeId: value })}
              >
                <SelectTrigger id="tradeId">
                  <SelectValue placeholder="اختر تداول (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون ربط</SelectItem>
                  {trades.map(trade => (
                    <SelectItem key={trade.id} value={trade.id}>
                      {trade.pair} - {new Date(trade.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">العلامات</Label>
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
              إلغاء
            </Button>
            <Button onClick={handleAddNote}>حفظ الملاحظة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تحرير ملاحظة */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تحرير الملاحظة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">العنوان</Label>
              <Input
                id="edit-title"
                placeholder="عنوان الملاحظة"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">المحتوى</Label>
              <Textarea
                id="edit-content"
                placeholder="اكتب ملاحظتك هنا..."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-tradeId">ربط بتداول (اختياري)</Label>
              <Select
                value={formData.tradeId}
                onValueChange={(value) => setFormData({ ...formData, tradeId: value })}
              >
                <SelectTrigger id="edit-tradeId">
                  <SelectValue placeholder="اختر تداول (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون ربط</SelectItem>
                  {trades.map(trade => (
                    <SelectItem key={trade.id} value={trade.id}>
                      {trade.pair} - {new Date(trade.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-tags">العلامات</Label>
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
              إلغاء
            </Button>
            <Button onClick={handleEditNote}>تحديث الملاحظة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف هذه الملاحظة بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-red-500 hover:bg-red-600">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Notebook;
