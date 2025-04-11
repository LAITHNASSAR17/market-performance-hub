
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrade } from '@/contexts/TradeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AlertCircle, Ban, Search, Shield, UserCog, Users, XCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, getAllUsers, deleteUser, blockUser, unblockUser, updateSystemSettings, getSystemSettings, getUserDetails } = useAuth();
  const { trades } = useTrade();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [userToToggleBlock, setUserToToggleBlock] = useState<{id: string, isBlocked: boolean} | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // System settings state
  const [platformName, setPlatformName] = useState(getSystemSettings().platformName);
  const [supportEmail, setSupportEmail] = useState(getSystemSettings().supportEmail);
  const [passwordPolicy, setPasswordPolicy] = useState(getSystemSettings().passwordPolicy);
  const [sessionTimeout, setSessionTimeout] = useState(getSystemSettings().sessionTimeout.toString());
  const [dataEncryption, setDataEncryption] = useState(getSystemSettings().dataEncryption || true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState((getSystemSettings().maxLoginAttempts || 5).toString());
  
  // Refresh users when database changes
  useEffect(() => {
    const handleDatabaseChange = () => {
      // Force a re-render
      setSearchTerm(prevTerm => prevTerm);
    };
    
    window.addEventListener('user-database-changed', handleDatabaseChange);
    
    return () => {
      window.removeEventListener('user-database-changed', handleDatabaseChange);
    };
  }, []);
  
  // Redirect to dashboard if not admin
  if (!isAdmin) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You do not have permission to access the admin dashboard",
    });
    navigate('/dashboard');
    return null;
  }

  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userTradeStats = allUsers.map(user => {
    const userTrades = trades.filter(trade => trade.userId === user.id);
    const totalTrades = userTrades.length;
    const totalProfit = userTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const winningTrades = userTrades.filter(trade => trade.profitLoss > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    return {
      userId: user.id,
      totalTrades,
      totalProfit,
      winRate
    };
  });

  const getTradingStats = (userId: string) => {
    return userTradeStats.find(stats => stats.userId === userId) || {
      totalTrades: 0,
      totalProfit: 0,
      winRate: 0
    };
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleToggleBlockUser = (userId: string, isCurrentlyBlocked: boolean) => {
    setUserToToggleBlock({ id: userId, isBlocked: isCurrentlyBlocked });
    setIsBlockDialogOpen(true);
  };

  const confirmToggleBlockUser = () => {
    if (userToToggleBlock) {
      if (userToToggleBlock.isBlocked) {
        unblockUser(userToToggleBlock.id);
      } else {
        blockUser(userToToggleBlock.id);
      }
      setIsBlockDialogOpen(false);
      setUserToToggleBlock(null);
    }
  };

  const handleSaveSettings = () => {
    updateSystemSettings({
      platformName,
      supportEmail,
      passwordPolicy,
      sessionTimeout: parseInt(sessionTimeout),
      dataEncryption,
      maxLoginAttempts: parseInt(maxLoginAttempts)
    });
  };

  const handleViewUserDetails = (userId: string) => {
    setSelectedUser(userId);
    setUserDetailsOpen(true);
  };

  const userDetails = selectedUser ? getUserDetails(selectedUser) : null;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <UserCog className="mr-2 h-6 w-6" />
          لوحة تحكم المسؤول
        </h1>
        <p className="text-gray-500">إدارة المستخدمين وإعدادات النظام</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>نظرة عامة على النظام</CardTitle>
            <CardDescription>المقاييس الرئيسية حول منصة التداول الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">إجمالي الصفقات</p>
                <p className="text-2xl font-bold">{trades.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">ربح المنصة</p>
                <p className="text-2xl font-bold">${trades.reduce((sum, trade) => sum + trade.profitLoss, 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
          <TabsTrigger value="trades">نشاط التداول</TabsTrigger>
          <TabsTrigger value="settings">إعدادات النظام</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>جميع المستخدمين</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث عن المستخدمين..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الصفقات</TableHead>
                      <TableHead>إجمالي الربح/الخسارة</TableHead>
                      <TableHead>معدل الفوز</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const stats = getTradingStats(user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge variant="default" className="bg-purple-500">مسؤول</Badge>
                            ) : (
                              <Badge variant="outline">مستخدم</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isBlocked ? (
                              <Badge variant="destructive">محظور</Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-500">نشط</Badge>
                            )}
                          </TableCell>
                          <TableCell>{stats.totalTrades}</TableCell>
                          <TableCell className={stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            ${stats.totalProfit.toFixed(2)}
                          </TableCell>
                          <TableCell>{stats.winRate.toFixed(0)}%</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewUserDetails(user.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                عرض
                              </Button>
                              {!user.isAdmin && (
                                <>
                                  <Button 
                                    variant={user.isBlocked ? "default" : "secondary"} 
                                    size="sm"
                                    onClick={() => handleToggleBlockUser(user.id, !!user.isBlocked)}
                                  >
                                    {user.isBlocked ? (
                                      <>
                                        <Ban className="h-4 w-4 mr-1" />
                                        إلغاء الحظر
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="h-4 w-4 mr-1" />
                                        حظر
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    حذف
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center text-gray-500">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>لم يتم العثور على مستخدمين</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>نشاط التداول</CardTitle>
              <CardDescription>مراقبة جميع صفقات المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الزوج</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الربح/الخسارة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.slice(0, 10).map((trade) => {
                      const tradeUser = allUsers.find(u => u.id === trade.userId);
                      return (
                        <TableRow key={trade.id}>
                          <TableCell>{trade.date}</TableCell>
                          <TableCell>{tradeUser?.name || 'غير معروف'}</TableCell>
                          <TableCell>{trade.pair}</TableCell>
                          <TableCell>{trade.type}</TableCell>
                          <TableCell className={trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                            ${trade.profitLoss.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">عرض</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {trades.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center text-gray-500">
                            <XCircle className="h-8 w-8 mb-2" />
                            <p>لم يتم العثور على صفقات</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
              <CardDescription>تكوين إعدادات النظام بأكمله</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">إعدادات المنصة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">اسم المنصة</Label>
                      <Input 
                        id="platform-name" 
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform-email">البريد الإلكتروني للدعم</Label>
                      <Input 
                        id="platform-email" 
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full md:w-auto" onClick={handleSaveSettings}>
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>تكوين إعدادات الأمان للمنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">أمان كلمة المرور</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-policy">سياسة كلمة المرور</Label>
                      <Select 
                        value={passwordPolicy} 
                        onValueChange={setPasswordPolicy}
                      >
                        <SelectTrigger id="password-policy">
                          <SelectValue placeholder="اختر سياسة كلمة المرور" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">منخفضة (الحد الأدنى 6 أحرف)</SelectItem>
                          <SelectItem value="medium">متوسطة (الحد الأدنى 8 أحرف، رقم واحد)</SelectItem>
                          <SelectItem value="high">عالية (الحد الأدنى 10 أحرف، أحرف كبيرة وصغيرة، أرقام، رموز)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-attempts">الحد الأقصى لمحاولات تسجيل الدخول</Label>
                      <Input 
                        id="max-attempts" 
                        type="number" 
                        value={maxLoginAttempts}
                        onChange={(e) => setMaxLoginAttempts(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">أمان الجلسة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">مهلة الجلسة (بالدقائق)</Label>
                      <Input 
                        id="session-timeout" 
                        type="number" 
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="data-encryption" 
                          checked={dataEncryption}
                          onCheckedChange={(checked) => setDataEncryption(checked as boolean)}
                        />
                        <Label htmlFor="data-encryption">تشفير البيانات</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        عند تمكينه، سيتم تشفير البيانات الحساسة في التخزين.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full md:w-auto" onClick={handleSaveSettings}>
                  حفظ إعدادات الأمان
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* تفاصيل المستخدم */}
      {userDetails && (
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المستخدم</DialogTitle>
              <DialogDescription>
                معلومات مفصلة عن المستخدم
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">المعلومات الأساسية</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">الاسم:</span> {userDetails.name}
                    </div>
                    <div>
                      <span className="font-semibold">البريد الإلكتروني:</span> {userDetails.email}
                    </div>
                    <div>
                      <span className="font-semibold">الدور:</span> {userDetails.isAdmin ? 'مسؤول' : 'مستخدم'}
                    </div>
                    <div>
                      <span className="font-semibold">الحالة:</span> {userDetails.isBlocked ? 'محظور' : 'نشط'}
                    </div>
                    <div>
                      <span className="font-semibold">تاريخ الإنشاء:</span> {new Date(userDetails.createdAt).toLocaleString('ar')}
                    </div>
                    <div>
                      <span className="font-semibold">آخر تسجيل دخول:</span> {userDetails.lastLogin ? new Date(userDetails.lastLogin).toLocaleString('ar') : 'لم يسجل الدخول بعد'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">نشاط التداول</h3>
                  <div className="space-y-2">
                    {allUsers.includes(userDetails) && (
                      <>
                        <div>
                          <span className="font-semibold">إجمالي الصفقات:</span> {getTradingStats(userDetails.id).totalTrades}
                        </div>
                        <div>
                          <span className="font-semibold">إجمالي الربح/الخسارة:</span>
                          <span className={getTradingStats(userDetails.id).totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            ${getTradingStats(userDetails.id).totalProfit.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">معدل الفوز:</span> {getTradingStats(userDetails.id).winRate.toFixed(0)}%
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {userDetails.loginHistory && userDetails.loginHistory.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg mb-2">سجل تسجيل الدخول</h3>
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetails.loginHistory.slice().reverse().map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(record.timestamp).toLocaleString('ar')}</TableCell>
                            <TableCell>
                              {record.success ? (
                                <Badge variant="default" className="bg-green-500">ناجح</Badge>
                              ) : (
                                <Badge variant="destructive">فاشل</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserDetailsOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock User Confirmation Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userToToggleBlock?.isBlocked ? "تأكيد إلغاء حظر المستخدم" : "تأكيد حظر المستخدم"}
            </DialogTitle>
            <DialogDescription>
              {userToToggleBlock?.isBlocked 
                ? "هل أنت متأكد أنك تريد إلغاء حظر هذا المستخدم؟ سيتمكن من تسجيل الدخول مرة أخرى."
                : "هل أنت متأكد أنك تريد حظر هذا المستخدم؟ لن يتمكن من تسجيل الدخول حتى يتم إلغاء الحظر."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              variant={userToToggleBlock?.isBlocked ? "default" : "destructive"} 
              onClick={confirmToggleBlockUser}
            >
              {userToToggleBlock?.isBlocked ? "إلغاء الحظر" : "حظر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
