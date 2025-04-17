
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/components/ui/use-toast';

interface AddAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createTradingAccount } = useTrade();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الحساب",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await createTradingAccount(name, parseFloat(balance) || 0);
      setName('');
      setBalance('');
      onClose();
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء حساب التداول الجديد",
      });
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة حساب تداول جديد</DialogTitle>
          <DialogDescription>
            أدخل معلومات حساب التداول الجديد الخاص بك
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">اسم الحساب</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حساب التداول الرئيسي"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account-balance">رصيد الحساب</Label>
            <Input
              id="account-balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="أدخل رصيد الحساب الحالي"
              step="any"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'جاري الإضافة...' : 'إضافة الحساب'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
