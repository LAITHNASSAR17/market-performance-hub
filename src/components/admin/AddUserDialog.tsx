import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { User } from '@/models/UserModel';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (userData: Partial<User>) => Promise<boolean>;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  onAddUser
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !email.trim() || !password || !userType) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    
    if (!email.includes('@')) {
      setError('الرجاء إدخال بريد إلكتروني صالح');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const userData: Partial<User> = {
        username: name,
        name,
        email,
        password,
        isAdmin: userType === 'admin',
      };
      
      const success = await onAddUser(userData);
      
      if (success) {
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setUserType('user');
        onOpenChange(false);
      }
    } catch (err) {
      setError('فشل إنشاء المستخدم. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المستخدم الجديد أدناه.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                الاسم
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="user@example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="******"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userType" className="text-right">
                نوع المستخدم
              </Label>
              <Select
                value={userType}
                onValueChange={setUserType}
              >
                <SelectTrigger id="userType" className="col-span-3">
                  <SelectValue placeholder="اختر نوع المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم عادي</SelectItem>
                  <SelectItem value="admin">مشرف (أدمن)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> 
                  إضافة مستخدم
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
