
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSharing, SharePermission, ShareItemType } from '@/hooks/useSharing';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: ShareItemType;
  itemTitle?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  itemId,
  itemType,
  itemTitle,
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('view');
  const { shareItem, isLoading } = useSharing();

  const handleShare = async () => {
    const success = await shareItem({
      itemId,
      itemType,
      email,
      permission,
    });
    
    if (success) {
      setEmail('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>مشاركة {itemType === 'trade' ? 'الصفقة' : 'الـ Playbook'}</DialogTitle>
          <DialogDescription>
            {itemTitle && <span className="block mt-1 font-medium">{itemTitle}</span>}
            أدخل البريد الإلكتروني للشخص الذي تريد المشاركة معه وحدد الصلاحيات
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>الصلاحيات</Label>
            <Select value={permission} onValueChange={(value) => setPermission(value as SharePermission)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">مشاهدة فقط</SelectItem>
                <SelectItem value="note">إضافة ملاحظات</SelectItem>
                <SelectItem value="edit">تعديل كامل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleShare} disabled={!email || isLoading}>
            {isLoading ? 'جاري المشاركة...' : 'مشاركة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
