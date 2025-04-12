
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface Hashtag {
  name: string;
  count: number;
  addedBy: string;
  lastUsed: string;
}

interface HashtagsTableProps {
  hashtags: Hashtag[];
  onAddHashtag: (name: string) => void;
  onEditHashtag: (oldName: string, newName: string) => void;
  onDeleteHashtag: (name: string) => void;
}

const HashtagsTable: React.FC<HashtagsTableProps> = ({
  hashtags,
  onAddHashtag,
  onEditHashtag,
  onDeleteHashtag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newHashtagName, setNewHashtagName] = useState('');
  const [currentHashtag, setCurrentHashtag] = useState<Hashtag | null>(null);
  const [error, setError] = useState('');

  const filteredHashtags = hashtags.filter(hashtag => 
    hashtag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddHashtag = () => {
    if (!newHashtagName.trim()) {
      setError('الرجاء إدخال اسم للهاشتاغ');
      return;
    }

    if (hashtags.some(tag => tag.name === newHashtagName.trim())) {
      setError('هذا الهاشتاغ موجود بالفعل');
      return;
    }

    onAddHashtag(newHashtagName.trim());
    setNewHashtagName('');
    setError('');
    setShowAddDialog(false);
  };

  const handleEditHashtag = () => {
    if (!currentHashtag) return;
    
    if (!newHashtagName.trim()) {
      setError('الرجاء إدخال اسم للهاشتاغ');
      return;
    }

    if (hashtags.some(tag => tag.name === newHashtagName.trim() && tag.name !== currentHashtag.name)) {
      setError('هذا الهاشتاغ موجود بالفعل');
      return;
    }

    onEditHashtag(currentHashtag.name, newHashtagName.trim());
    setNewHashtagName('');
    setError('');
    setShowEditDialog(false);
  };

  const handleDeleteHashtag = () => {
    if (!currentHashtag) return;
    
    onDeleteHashtag(currentHashtag.name);
    setShowDeleteDialog(false);
  };

  const openEditDialog = (hashtag: Hashtag) => {
    setCurrentHashtag(hashtag);
    setNewHashtagName(hashtag.name);
    setError('');
    setShowEditDialog(true);
  };

  const openDeleteDialog = (hashtag: Hashtag) => {
    setCurrentHashtag(hashtag);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row mb-4 gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="بحث عن الهاشتاغ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="flex items-center" 
          onClick={() => {
            setNewHashtagName('');
            setError('');
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          إضافة هاشتاغ
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الهاشتاغ</TableHead>
              <TableHead>عدد الاستخدامات</TableHead>
              <TableHead>بواسطة</TableHead>
              <TableHead>آخر استخدام</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHashtags.length > 0 ? (
              filteredHashtags.map((hashtag) => (
                <TableRow key={hashtag.name} className="hover:bg-slate-50">
                  <TableCell className="font-medium">#{hashtag.name}</TableCell>
                  <TableCell>{hashtag.count}</TableCell>
                  <TableCell>{hashtag.addedBy}</TableCell>
                  <TableCell>{hashtag.lastUsed}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(hashtag)}
                        className="text-amber-600 border-amber-600 hover:bg-amber-50 h-8 w-8 p-0"
                        title="تعديل الهاشتاغ"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDeleteDialog(hashtag)}
                        className="text-red-600 border-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        title="حذف الهاشتاغ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {searchTerm 
                    ? "لا توجد هاشتاغات تطابق البحث"
                    : "لا توجد هاشتاغات. أضف بعض الهاشتاغات لتظهر هنا."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Hashtag Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة هاشتاغ جديد</DialogTitle>
            <DialogDescription>
              أدخل اسم الهاشتاغ الجديد لإضافته إلى النظام.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                اسم الهاشتاغ
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  #
                </span>
                <Input
                  id="name"
                  value={newHashtagName}
                  onChange={(e) => setNewHashtagName(e.target.value)}
                  className="pl-7"
                  placeholder="أدخل اسم الهاشتاغ"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddHashtag}>
              إضافة الهاشتاغ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hashtag Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الهاشتاغ</DialogTitle>
            <DialogDescription>
              تعديل اسم الهاشتاغ #{currentHashtag?.name}.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right">
                اسم الهاشتاغ
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  #
                </span>
                <Input
                  id="editName"
                  value={newHashtagName}
                  onChange={(e) => setNewHashtagName(e.target.value)}
                  className="pl-7"
                  placeholder="أدخل اسم الهاشتاغ الجديد"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditHashtag}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Hashtag Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>حذف الهاشتاغ</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف الهاشتاغ #{currentHashtag?.name}؟
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-amber-600">
              سيؤدي هذا إلى إزالة الهاشتاغ من جميع الصفقات المرتبطة به.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteHashtag}>
              نعم، حذف الهاشتاغ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HashtagsTable;
