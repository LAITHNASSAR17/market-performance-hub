
import React, { useState } from 'react';
import { Search, Lock, UserCheck, UserX, Eye, Send, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface UserTableProps {
  users: any[];
  onBlock: (user: any) => void;
  onUnblock: (user: any) => void;
  onChangePassword: (email: string, password: string) => Promise<void>;
  onViewUser: (userId: string) => void;
  onSetAdmin: (user: any, isAdmin: boolean) => void;
  onAddUser: (userData: { name: string, email: string, password: string, isAdmin: boolean }) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onBlock,
  onUnblock,
  onChangePassword,
  onViewUser,
  onSetAdmin,
  onAddUser,
  searchTerm,
  setSearchTerm
}) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // New user form state
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  });

  const handleOpenPasswordModal = (user: any) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setNewPassword('');
    setError('');
    setSelectedUser(null);
  };

  const handleOpenAddUserModal = () => {
    setShowAddUserModal(true);
    setNewUserData({
      name: '',
      email: '',
      password: '',
      isAdmin: false
    });
  };

  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
    setError('');
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      setError('الرجاء إدخال كلمة مرور جديدة.');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
      return;
    }

    if (selectedUser) {
      try {
        setIsSubmitting(true);
        await onChangePassword(selectedUser.email, newPassword);
        handleClosePasswordModal();
      } catch (err) {
        setError('فشل تغيير كلمة المرور. الرجاء المحاولة مرة أخرى.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddUser = async () => {
    // Validate form data
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (newUserData.password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      setError('الرجاء إدخال بريد إلكتروني صحيح.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddUser(newUserData);
      handleCloseAddUserModal();
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تم إضافة المستخدم ${newUserData.name} بنجاح`,
      });
    } catch (err: any) {
      setError(`فشل إضافة المستخدم: ${err.message || 'الرجاء المحاولة مرة أخرى.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAdmin = (user: any) => {
    onSetAdmin(user, !user.isAdmin);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pr-10"
            placeholder="بحث عن المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAddUserModal} className="mr-2 bg-indigo-600 hover:bg-indigo-700">
          إضافة مستخدم جديد
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">المعرف</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الصلاحية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{user.id.substring(0, 5)}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{user.email}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        أدمن
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        مستخدم
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive">
                        محظور
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500">
                        نشط
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                        title="عرض المستخدم"
                        onClick={() => onViewUser(user.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenPasswordModal(user)}
                        className="text-amber-600 border-amber-600 hover:bg-amber-50 h-8 w-8 p-0"
                        title="تغيير كلمة المرور"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleAdmin(user)}
                        className={user.isAdmin 
                          ? "text-purple-600 border-purple-600 hover:bg-purple-50 h-8 w-8 p-0"
                          : "text-indigo-600 border-indigo-600 hover:bg-indigo-50 h-8 w-8 p-0"}
                        title={user.isAdmin ? "إزالة صلاحيات الأدمن" : "منح صلاحيات الأدمن"}
                      >
                        {user.isAdmin ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                      {user.isBlocked ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onUnblock(user)}
                          className="text-green-600 border-green-600 hover:bg-green-50 h-8 w-8 p-0"
                          title="إلغاء حظر المستخدم"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onBlock(user)}
                          className="text-red-600 border-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          title="حظر المستخدم"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm 
                    ? "لا يوجد مستخدمين يطابقون البحث."
                    : "لم يتم العثور على مستخدمين."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-left">
                يتم عرض: {filteredUsers.length} / {users.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
            <DialogDescription>
              أدخل كلمة مرور جديدة لـ {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                كلمة المرور الجديدة
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                className="col-span-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="outline" onClick={handleClosePasswordModal}>
              إلغاء
            </Button>
            <Button type="button" onClick={handleChangePassword} className="bg-purple-600 hover:bg-purple-700">
              <Lock className="ml-2 h-4 w-4" />
              تغيير كلمة المرور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المستخدم الجديد للنظام
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
                الاسم
              </Label>
              <Input
                id="name"
                placeholder="أدخل اسم المستخدم"
                className="col-span-3"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                className="col-span-3"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                className="col-span-3"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                صلاحيات الأدمن
              </Label>
              <div className="col-span-3 flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="isAdmin" 
                  checked={newUserData.isAdmin}
                  onCheckedChange={(checked) => 
                    setNewUserData({...newUserData, isAdmin: checked as boolean})
                  }
                />
                <Label htmlFor="isAdmin" className="mr-2">
                  منح صلاحيات المدير
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="outline" onClick={handleCloseAddUserModal}>
              إلغاء
            </Button>
            <Button type="button" onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700">
              إضافة المستخدم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTable;
