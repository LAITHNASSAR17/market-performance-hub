
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTrade } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

const TradingAccountsDialog = () => {
  const [name, setName] = React.useState('');
  const [accountType, setAccountType] = React.useState('live');
  const [balance, setBalance] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const { fetchTradingAccounts } = useTrade();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الحساب",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating account with user ID:', user.id);
      
      // Use the userService to create a trading account
      const newAccount = await userService.createTradingAccount(
        user.id,
        name.trim(),
        parseFloat(balance) || 0,
        accountType
      );
      
      console.log('Account created successfully:', newAccount);
      
      // Refresh the accounts list
      await fetchTradingAccounts();
      
      // Reset form
      setName('');
      setAccountType('live');
      setBalance('');
      setIsOpen(false);
      
      toast({
        title: "تم إنشاء الحساب",
        description: `تم إنشاء الحساب ${name} بنجاح`,
      });
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="px-3">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة حساب تداول جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">اسم الحساب</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حسابي الرئيسي"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="accountType">نوع الحساب</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger id="accountType">
                <SelectValue placeholder="اختر نوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">حقيقي</SelectItem>
                <SelectItem value="demo">تجريبي</SelectItem>
                <SelectItem value="funded">مُموَّل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="balance">الرصيد الأولي</Label>
            <Input
              id="balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة الحساب'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TradingAccountsDialog;
