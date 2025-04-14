
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Crown, Filter } from 'lucide-react';

const AdminSubscriptions: React.FC = () => {
  const { users, getAllUsers, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    setLoading(true);
    await getAllUsers();
    setLoading(false);
  };
  
  const handleUpdateSubscription = async (userId: string, newTier: string) => {
    try {
      setLoading(true);
      
      // Find the user
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      // Update the user with the new subscription tier
      const updatedUser = {
        ...user,
        subscription_tier: newTier
      };
      
      await updateUser(updatedUser);
      
      toast({
        title: "اشتراك محدث",
        description: `تم تحديث اشتراك المستخدم إلى ${newTier} بنجاح`
      });
      
      // Refresh the user list
      await loadUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الاشتراك. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredUsers = users
    .filter(user => 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (tierFilter === 'all' || user.subscription_tier === tierFilter)
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">إدارة الاشتراكات</h1>
          <Button onClick={loadUsers} disabled={loading}>
            {loading ? "جاري التحميل..." : "تحديث البيانات"}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>المستخدمين والاشتراكات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="البحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="w-full sm:w-64">
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>{tierFilter === 'all' ? 'جميع الخطط' : tierFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الخطط</SelectItem>
                    <SelectItem value="free">المجانية</SelectItem>
                    <SelectItem value="basic">الأساسية</SelectItem>
                    <SelectItem value="pro">الاحترافية</SelectItem>
                    <SelectItem value="premium">المميزة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>خطة الاشتراك</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || 'غير محدد'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.subscription_tier === 'free' && (
                            <Badge variant="secondary">مجاني</Badge>
                          )}
                          {user.subscription_tier === 'basic' && (
                            <Badge variant="outline">أساسي</Badge>
                          )}
                          {user.subscription_tier === 'pro' && (
                            <Badge variant="default">احترافي</Badge>
                          )}
                          {user.subscription_tier === 'premium' && (
                            <Badge className="bg-amber-500">
                              <Crown className="h-3 w-3 mr-1" />
                              مميز
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.created_at 
                            ? new Date(user.created_at).toLocaleDateString() 
                            : 'غير متوفر'}
                        </TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={user.subscription_tier || 'free'}
                            onValueChange={(value) => handleUpdateSubscription(user.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="اختر خطة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">مجاني</SelectItem>
                              <SelectItem value="basic">أساسي</SelectItem>
                              <SelectItem value="pro">احترافي</SelectItem>
                              <SelectItem value="premium">مميز</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        {loading 
                          ? "جاري تحميل البيانات..." 
                          : searchTerm 
                            ? "لا توجد نتائج مطابقة للبحث" 
                            : "لا يوجد مستخدمين بعد"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
