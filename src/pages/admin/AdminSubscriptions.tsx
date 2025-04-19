
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, ArrowUp, ArrowDown, Check, X, Badge as BadgeIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const AdminSubscriptions: React.FC = () => {
  const { users, getAllUsers, updateSubscriptionTier } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newTier, setNewTier] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      await getAllUsers();
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: "فشل في تحميل بيانات المستخدمين",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter users based on search term and tier
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTier = tierFilter === 'all' ? true : user.subscription_tier === tierFilter;
    
    return matchesSearch && matchesTier;
  });
  
  // Open upgrade modal for a user
  const handleOpenUpgradeModal = (user: any) => {
    setSelectedUser(user);
    setNewTier(user.subscription_tier || 'free');
    setShowUpgradeModal(true);
  };
  
  // Update user's subscription tier
  const handleUpdateTier = async () => {
    if (!selectedUser || !newTier) return;
    
    try {
      await updateSubscriptionTier(selectedUser.id, newTier);
      setShowUpgradeModal(false);
      
      toast({
        title: "تم تحديث الاشتراك",
        description: `تم تغيير اشتراك ${selectedUser.name} إلى ${getArabicTierName(newTier)}`
      });
      
      // Refresh user list
      loadUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "فشل التحديث",
        description: "تعذر تحديث مستوى الاشتراك",
        variant: "destructive"
      });
    }
  };
  
  // Get badge color based on subscription tier
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'enterprise':
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case 'free':
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  // Get Arabic tier name
  const getArabicTierName = (tier: string) => {
    switch (tier) {
      case 'premium':
        return "بريميوم";
      case 'enterprise':
        return "متقدم";
      case 'free':
      default:
        return "مجاني";
    }
  };
  
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          إدارة الاشتراكات
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          إدارة وتحديث خطط اشتراك المستخدمين.
        </p>
      </header>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 pr-4"
              placeholder="بحث عن مستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="تصفية حسب الخطة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الخطط</SelectItem>
              <SelectItem value="free">مجاني</SelectItem>
              <SelectItem value="premium">بريميوم</SelectItem>
              <SelectItem value="enterprise">متقدم</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
            {isLoading ? "جاري التحميل..." : "تحديث"}
          </Button>
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الخطة الحالية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTierBadgeColor(user.subscription_tier || 'free')}>
                        {user.subscription_tier ? getArabicTierName(user.subscription_tier) : 'مجاني'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          <X className="mr-1 h-3 w-3" />
                          محظور
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          نشط
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenUpgradeModal(user)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <BadgeIcon className="mr-1 h-4 w-4" />
                        تغيير الخطة
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {searchTerm || tierFilter !== 'all' 
                      ? "لا يوجد مستخدمين يطابقون عوامل التصفية الحالية" 
                      : "لم يتم العثور على مستخدمين"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Change Subscription Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير خطة الاشتراك</DialogTitle>
            <DialogDescription>
              تحديث خطة الاشتراك لـ {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">الخطة الحالية</label>
              <div className="text-lg font-semibold">
                {selectedUser?.subscription_tier 
                  ? getArabicTierName(selectedUser.subscription_tier)
                  : 'مجاني'}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">الخطة الجديدة</label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر خطة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="premium">بريميوم</SelectItem>
                  <SelectItem value="enterprise">متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateTier}>
              تحديث الاشتراك
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
