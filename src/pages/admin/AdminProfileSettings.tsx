
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, Key, Lock, LogOut, Save, Globe, Clock, Shield, 
  UserCog, Upload, Check, AlertCircle, Settings, Bell, 
  Database, FileText, Mail, Server, Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

// Sample timezone list
const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
  { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
  { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (GMT+1)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GMT+4)' },
  { value: 'Asia/Amman', label: 'Eastern European Time (GMT+2)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (GMT+9)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (GMT+10)' },
];

// Sample session data
const activeSessions = [
  { id: 1, device: 'Chrome on Windows', ip: '198.51.100.42', lastActive: new Date(), current: true },
  { id: 2, device: 'Safari on MacOS', ip: '203.0.113.89', lastActive: new Date(Date.now() - 86400000) },
  { id: 3, device: 'Firefox on Linux', ip: '192.0.2.146', lastActive: new Date(Date.now() - 172800000) },
];

// Sample audit logs
const auditLogs = [
  { id: 1, action: 'User Login', user: 'admin@example.com', timestamp: new Date(), ip: '198.51.100.42' },
  { id: 2, action: 'User Updated', user: 'user123', timestamp: new Date(Date.now() - 3600000), ip: '203.0.113.89' },
  { id: 3, action: 'Settings Changed', user: 'admin@example.com', timestamp: new Date(Date.now() - 7200000), ip: '192.0.2.146' },
  { id: 4, action: 'User Blocked', user: 'spammer456', timestamp: new Date(Date.now() - 86400000), ip: '198.51.100.42' },
  { id: 5, action: 'Backup Created', user: 'admin@example.com', timestamp: new Date(Date.now() - 172800000), ip: '203.0.113.89' },
];

const AdminProfileSettings: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.name?.split(' ')[0]?.toLowerCase() || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState('/placeholder.svg');
  const [timezone, setTimezone] = useState('America/New_York');
  const [adminRole, setAdminRole] = useState('Admin');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Platform Controls state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [userRegistration, setUserRegistration] = useState(true);
  const [smtpHost, setSmtpHost] = useState('smtp.example.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [newUserNotification, setNewUserNotification] = useState(true);
  const [newTradeNotification, setNewTradeNotification] = useState(true);
  const [errorNotification, setErrorNotification] = useState(true);
  
  useEffect(() => {
    // Load user data when component mounts
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUsername(user.name?.split(' ')[0]?.toLowerCase() || '');
    }
  }, [user]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateProfile(name, email);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await updateProfile(user?.name || '', user?.email || '', currentPassword, newPassword);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
        icon: <Check className="h-4 w-4" />
      });
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleLogoutAllDevices = async () => {
    try {
      // Logic to logout from all devices would go here
      toast({
        title: "Success",
        description: "You have been logged out from all devices",
      });
      logout(); // Logout from current device as well
    } catch (error) {
      console.error('Error logging out from all devices:', error);
      toast({
        title: "Error",
        description: "There was an error logging out from all devices. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSavePlatformSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Platform settings have been updated successfully",
      icon: <Check className="h-4 w-4" />
    });
  };
  
  const handleSaveNotificationSettings = () => {
    toast({
      title: "Notification Preferences Saved",
      description: "Your notification preferences have been updated",
      icon: <Check className="h-4 w-4" />
    });
  };
  
  const handleBackupDatabase = () => {
    toast({
      title: "Backup Started",
      description: "Database backup has been initiated",
      icon: <Check className="h-4 w-4" />
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Data export has been initiated",
      icon: <Check className="h-4 w-4" />
    });
  };

  return (
    <AdminLayout>
      <div className="container max-w-6xl py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          {language === 'ar' ? 'إعدادات المسؤول' : 'Admin Settings'}
        </h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {language === 'ar' ? 'الأمان' : 'Security'}
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {language === 'ar' ? 'إعدادات المنصة' : 'Platform'}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {language === 'ar' ? 'الإشعارات' : 'Notifications'}
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {language === 'ar' ? 'السجلات' : 'Logs'}
            </TabsTrigger>
          </TabsList>
          
          {/* Admin Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'معلومات الملف الشخصي للمسؤول' : 'Admin Profile Information'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'تحديث معلومات حساب المسؤول وتفضيلاته.' 
                    : 'Update your admin account information and preferences.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid gap-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <img 
                            src={profilePicture} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          className="absolute -bottom-2 -right-2 rounded-full p-1"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="sr-only">Upload</span>
                        </Button>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium dark:text-white mb-1">
                          {language === 'ar' ? 'صورة الملف الشخصي للمسؤول' : 'Admin Profile Picture'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {language === 'ar' 
                            ? 'قم بتحميل صورة بحجم 1:1 وبدقة عالية.' 
                            : 'Upload a 1:1 aspect ratio image with high resolution.'}
                        </p>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm">
                            {language === 'ar' ? 'تحميل صورة' : 'Upload Image'}
                          </Button>
                          <Button type="button" variant="ghost" size="sm">
                            {language === 'ar' ? 'إزالة' : 'Remove'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="admin-name">
                        {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </Label>
                      <Input 
                        id="admin-name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="admin-username">
                        {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                      </Label>
                      <Input 
                        id="admin-username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter your username'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="admin-email">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                      </Label>
                      <Input 
                        id="admin-email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="language">
                        {language === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="admin-language-toggle" 
                            checked={language === 'ar'} 
                            onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
                          />
                          <Label htmlFor="admin-language-toggle">
                            {language === 'ar' ? 'العربية' : 'English'} / {language === 'ar' ? 'English' : 'العربية'}
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="admin-timezone">
                          {language === 'ar' ? 'المنطقة الزمنية' : 'Time Zone'}
                        </Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger id="admin-timezone">
                            <SelectValue placeholder={language === 'ar' ? 'اختر المنطقة الزمنية' : 'Select timezone'} />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((timezone) => (
                              <SelectItem key={timezone.value} value={timezone.value}>
                                {timezone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-3">
                        <Label htmlFor="admin-role">
                          {language === 'ar' ? 'دور المسؤول' : 'Admin Role'}
                        </Label>
                        <Select 
                          value={adminRole} 
                          onValueChange={setAdminRole}
                          disabled // Readonly as this is typically assigned by a super admin
                        >
                          <SelectTrigger id="admin-role">
                            <SelectValue placeholder={language === 'ar' ? 'اختر الدور' : 'Select role'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        {isUpdating ? (
                          language === 'ar' ? 'جارٍ التحديث...' : 'Updating...'
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'تحديث كلمة المرور للحفاظ على أمان حساب المسؤول.' 
                    : 'Update your password to maintain admin account security.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange}>
                  {passwordError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 dark:bg-red-900/30 dark:text-red-400">
                      {passwordError}
                    </div>
                  )}
                  
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="adminCurrentPassword">
                        {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                      </Label>
                      <Input 
                        id="adminCurrentPassword" 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter your current password'}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-3">
                      <Label htmlFor="adminNewPassword">
                        {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                      </Label>
                      <Input 
                        id="adminNewPassword" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="adminConfirmPassword">
                        {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                      </Label>
                      <Input 
                        id="adminConfirmPassword" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={language === 'ar' ? 'أكد كلمة المرور الجديدة' : 'Confirm your new password'}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isChangingPassword}
                        className="flex items-center gap-2"
                      >
                        {isChangingPassword ? (
                          language === 'ar' ? 'جارٍ التحديث...' : 'Updating...'
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'تعزيز أمان حساب المسؤول باستخدام المصادقة الثنائية.' 
                    : 'Enhance your admin account security with two-factor authentication.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium dark:text-white">
                      {language === 'ar' ? 'المصادقة الثنائية للمسؤول' : 'Admin Two-Factor Authentication'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {twoFactorEnabled 
                        ? (language === 'ar' ? 'المصادقة الثنائية مفعلة' : '2FA is currently enabled') 
                        : (language === 'ar' ? 'المصادقة الثنائية غير مفعلة' : '2FA is currently disabled')}
                    </p>
                  </div>
                  <Switch 
                    checked={twoFactorEnabled} 
                    onCheckedChange={setTwoFactorEnabled}
                    aria-label={language === 'ar' ? 'تبديل المصادقة الثنائية' : 'Toggle two-factor authentication'}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    {language === 'ar' 
                      ? 'يوصى بشدة بتمكين المصادقة الثنائية لحسابات المسؤولين لتعزيز الأمان. ستتوفر هذه الميزة قريبًا.' 
                      : 'Enabling two-factor authentication is strongly recommended for admin accounts to enhance security. This feature will be available soon.'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'إدارة الجلسات' : 'Session Management'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'عرض وإدارة جلسات تسجيل الدخول النشطة.' 
                    : 'View and manage your active login sessions.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'الجهاز' : 'Device'}</TableHead>
                      <TableHead>{language === 'ar' ? 'عنوان IP' : 'IP Address'}</TableHead>
                      <TableHead>{language === 'ar' ? 'آخر نشاط' : 'Last Active'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.device}</TableCell>
                        <TableCell>{session.ip}</TableCell>
                        <TableCell>{format(session.lastActive, 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          {session.current 
                            ? <span className="text-green-600 dark:text-green-400">{language === 'ar' ? 'الجلسة الحالية' : 'Current'}</span>
                            : <span>{language === 'ar' ? 'نشط' : 'Active'}</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-6">
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={handleLogoutAllDevices}
                  >
                    <LogOut className="h-4 w-4" />
                    {language === 'ar' ? 'تسجيل الخروج من كافة الأجهزة' : 'Logout from All Devices'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Platform Controls Tab */}
          <TabsContent value="platform">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'إعدادات المنصة الأساسية' : 'Platform Controls'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'إدارة إعدادات المنصة الأساسية والوصول العام.' 
                    : 'Manage core platform settings and public access.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-medium dark:text-white">
                        {language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'ar' 
                          ? 'تعطيل الوصول العام إلى المنصة أثناء الصيانة.' 
                          : 'Disable public access to the platform during maintenance.'}
                      </p>
                    </div>
                    <Switch 
                      checked={maintenanceMode} 
                      onCheckedChange={setMaintenanceMode}
                      aria-label={language === 'ar' ? 'تبديل وضع الصيانة' : 'Toggle maintenance mode'}
                    />
                  </div>
                  
                  {maintenanceMode && (
                    <div className="grid gap-3">
                      <Label htmlFor="maintenance-message">
                        {language === 'ar' ? 'رسالة الصيانة' : 'Maintenance Message'}
                      </Label>
                      <Textarea 
                        id="maintenance-message" 
                        value={maintenanceMessage} 
                        onChange={(e) => setMaintenanceMessage(e.target.value)} 
                        placeholder={language === 'ar' 
                          ? 'أدخل الرسالة التي سيراها المستخدمون أثناء وضع الصيانة' 
                          : 'Enter the message users will see during maintenance mode'}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-medium dark:text-white">
                        {language === 'ar' ? 'تسجيل المستخدمين' : 'User Registration'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'ar' 
                          ? 'السماح للمستخدمين الجدد بالتسجيل في المنصة.' 
                          : 'Allow new users to register to the platform.'}
                      </p>
                    </div>
                    <Switch 
                      checked={userRegistration} 
                      onCheckedChange={setUserRegistration}
                      aria-label={language === 'ar' ? 'تبديل تسجيل المستخدمين' : 'Toggle user registration'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'إعدادات SMTP' : 'SMTP Settings'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'تكوين خادم البريد الإلكتروني لإرسال إشعارات النظام.' 
                    : 'Configure email server for system notifications.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="smtp-host">
                        {language === 'ar' ? 'خادم SMTP' : 'SMTP Host'}
                      </Label>
                      <Input 
                        id="smtp-host" 
                        value={smtpHost} 
                        onChange={(e) => setSmtpHost(e.target.value)} 
                        placeholder="smtp.example.com"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="smtp-port">
                        {language === 'ar' ? 'منفذ SMTP' : 'SMTP Port'}
                      </Label>
                      <Input 
                        id="smtp-port" 
                        value={smtpPort} 
                        onChange={(e) => setSmtpPort(e.target.value)} 
                        placeholder="587"
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="smtp-user">
                        {language === 'ar' ? 'اسم مستخدم SMTP' : 'SMTP Username'}
                      </Label>
                      <Input 
                        id="smtp-user" 
                        value={smtpUser} 
                        onChange={(e) => setSmtpUser(e.target.value)} 
                        placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="smtp-password">
                        {language === 'ar' ? 'كلمة مرور SMTP' : 'SMTP Password'}
                      </Label>
                      <Input 
                        id="smtp-password" 
                        type="password" 
                        value={smtpPassword} 
                        onChange={(e) => setSmtpPassword(e.target.value)} 
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSavePlatformSettings}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {language === 'ar' ? 'حفظ إعدادات المنصة' : 'Save Platform Settings'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'النسخ الاحتياطي واستيراد البيانات' : 'Backup & Data Export'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'إدارة النسخ الاحتياطية للبيانات واستيرادها.' 
                    : 'Manage data backups and exports.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-medium dark:text-white">
                        {language === 'ar' ? 'النسخ الاحتياطي للقاعدة البيانات' : 'Database Backup'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'ar' 
                          ? 'إنشاء نسخة احتياطية كاملة لقاعدة البيانات.' 
                          : 'Create a full backup of the database.'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 whitespace-nowrap"
                      onClick={handleBackupDatabase}
                    >
                      <Database className="h-4 w-4" />
                      {language === 'ar' ? 'بدء النسخ الاحتياطي' : 'Start Backup'}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-medium dark:text-white">
                        {language === 'ar' ? 'تصدير البيانات' : 'Export Data'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'ar' 
                          ? 'تصدير بيانات المستخدم أو بيانات التداول.' 
                          : 'Export user or trading data.'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 whitespace-nowrap"
                        onClick={handleExportData}
                      >
                        <Download className="h-4 w-4" />
                        {language === 'ar' ? 'تصدير المستخدمين' : 'Export Users'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 whitespace-nowrap"
                        onClick={handleExportData}
                      >
                        <Download className="h-4 w-4" />
                        {language === 'ar' ? 'تصدير التداولات' : 'Export Trades'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Preferences Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'إدارة كيفية تلقي إشعارات النظام.' 
                    : 'Manage how you receive system notifications.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 dark:text-white">
                      {language === 'ar' ? 'قنوات الإشعارات' : 'Notification Channels'}
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="email-notifications" className="cursor-pointer">
                            {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                          </Label>
                        </div>
                        <Switch 
                          id="email-notifications" 
                          checked={emailNotifications} 
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="in-app-notifications" className="cursor-pointer">
                            {language === 'ar' ? 'إشعارات داخل التطبيق' : 'In-app Notifications'}
                          </Label>
                        </div>
                        <Switch 
                          id="in-app-notifications" 
                          checked={inAppNotifications} 
                          onCheckedChange={setInAppNotifications}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 dark:text-white">
                      {language === 'ar' ? 'أحداث الإشعارات' : 'Notification Events'}
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="new-user-notification" className="cursor-pointer">
                          {language === 'ar' ? 'مستخدم جديد مسجل' : 'New User Registered'}
                        </Label>
                        <Switch 
                          id="new-user-notification" 
                          checked={newUserNotification} 
                          onCheckedChange={setNewUserNotification}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="new-trade-notification" className="cursor-pointer">
                          {language === 'ar' ? 'تداول جديد مضاف' : 'New Trade Added'}
                        </Label>
                        <Switch 
                          id="new-trade-notification" 
                          checked={newTradeNotification} 
                          onCheckedChange={setNewTradeNotification}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="error-notification" className="cursor-pointer">
                          {language === 'ar' ? 'خطأ في API' : 'API Error'}
                        </Label>
                        <Switch 
                          id="error-notification" 
                          checked={errorNotification} 
                          onCheckedChange={setErrorNotification}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveNotificationSettings}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {language === 'ar' ? 'حفظ تفضيلات الإشعارات' : 'Save Notification Preferences'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'سجل المراجعة' : 'Audit Logs'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'عرض وتحليل سجلات إجراءات النظام.' 
                    : 'View and analyze system action logs.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <Input 
                        placeholder={language === 'ar' ? 'بحث في السجلات...' : 'Search logs...'}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={language === 'ar' ? 'نوع الحدث' : 'Event Type'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === 'ar' ? 'جميع الأحداث' : 'All Events'}</SelectItem>
                          <SelectItem value="login">{language === 'ar' ? 'تسجيل الدخول' : 'Login'}</SelectItem>
                          <SelectItem value="update">{language === 'ar' ? 'تحديث' : 'Update'}</SelectItem>
                          <SelectItem value="delete">{language === 'ar' ? 'حذف' : 'Delete'}</SelectItem>
                          <SelectItem value="error">{language === 'ar' ? 'خطأ' : 'Error'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        {language === 'ar' ? 'تصفية' : 'Filter'}
                      </Button>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'الإجراء' : 'Action'}</TableHead>
                        <TableHead>{language === 'ar' ? 'المستخدم' : 'User'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الوقت' : 'Timestamp'}</TableHead>
                        <TableHead>{language === 'ar' ? 'عنوان IP' : 'IP Address'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.action}</TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>{format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}</TableCell>
                          <TableCell>{log.ip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProfileSettings;
