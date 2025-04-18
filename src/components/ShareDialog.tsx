
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
import { Link, Copy, CopyCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

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
  const [copied, setCopied] = useState(false);
  const { shareItem, isLoading } = useSharing();
  const { toast } = useToast();

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

  // Updated to use the correct public URL format
  const shareLink = `${window.location.origin}/public/${itemType}/${itemId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الرابط بنجاح"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ الرابط",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>مشاركة {itemType === 'trade' ? 'الصفقة' : 'الـ Playbook'}</DialogTitle>
          <DialogDescription>
            {itemTitle && <span className="block mt-1 font-medium">{itemTitle}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Link className="h-4 w-4 text-muted-foreground" />
          <Input 
            value={shareLink}
            readOnly
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={copyLink}
          >
            {copied ? (
              <CopyCheck className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
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

        <DialogFooter className="mt-4">
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
