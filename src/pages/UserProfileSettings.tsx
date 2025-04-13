
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User, Key, Lock, LogOut, Save, Globe, Clock, Trash2, CreditCard, 
  ShieldAlert, UserCog, Upload, Check, AlertCircle
} from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

// Sample country list for demonstration
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jo', label: 'Jordan' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'eg', label: 'Egypt' },
];

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

const UserProfileSettings: React.FC = () => {
  const { user, updateProfile, logout, updateSubscriptionTier, changePassword } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  
  // User info form state
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.name?.split(' ')[0]?.toLowerCase() || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState('/placeholder.svg');
  const [country, setCountry] = useState('us');
  const [timezone, setTimezone] = useState('America/New_York');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Delete account dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  useEffect(() => {
    // Load user data when component mounts
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      // Initialize with placeholder values if needed
      setUsername(user.name?.split(' ')[0]?.toLowerCase() || '');
      // Additional fields would be loaded here if they were in the user object
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
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation Failed",
        description: "Please type DELETE to confirm account deletion",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Account deletion logic would go here
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
        variant: "destructive"
      });
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "There was an error deleting your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteConfirmText('');
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
  
  const handleUpgradePlan = () => {
    // Navigate to the payment page
    window.location.href = '/payment';
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
        </h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {language === 'ar' ? 'المعلومات الشخصية' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {language === 'ar' ? 'الأمان' : 'Security'}
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {language === 'ar' ? 'الاشتراك' : 'Subscription'}
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              {language === 'ar' ? 'إدارة الحساب' : 'Account'}
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'المعلومات الشخصية' : 'Profile Information'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'تحديث معلومات ملفك الشخصي وتفضيلاتك.' 
                    : 'Update your account information and preferences.'}
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
                          {language === 'ar' ? 'صورة الملف الشخصي' : 'Profile Picture'}
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
                      <Label htmlFor="name">
                        {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="username">
                        {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                      </Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter your username'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="email">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                      </Label>
                      <Input 
                        id="email" 
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
                            id="language-toggle" 
                            checked={language === 'ar'} 
                            onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
                          />
                          <Label htmlFor="language-toggle">
                            {language === 'ar' ? 'العربية' : 'English'} / {language === 'ar' ? 'English' : 'العربية'}
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="country">
                          {language === 'ar' ? 'الدولة' : 'Country'}
                        </Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger id="country">
                            <SelectValue placeholder={language === 'ar' ? 'اختر الدولة' : 'Select country'} />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-3">
                        <Label htmlFor="timezone">
                          {language === 'ar' ? 'المنطقة الزمنية' : 'Time Zone'}
                        </Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger id="timezone">
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
                    ? 'تحديث كلمة المرور للحفاظ على أمان حسابك.' 
                    : 'Update your password to maintain account security.'}
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
                      <Label htmlFor="currentPassword">
                        {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                      </Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter your current password'}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-3">
                      <Label htmlFor="newPassword">
                        {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                      </Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password'}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">
                        {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                      </Label>
                      <Input 
                        id="confirmPassword" 
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
            
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'تعزيز أمان حسابك باستخدام المصادقة الثنائية.' 
                    : 'Enhance your account security with two-factor authentication.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium dark:text-white">
                      {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
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
                      ? 'ستتوفر هذه الميزة قريبًا. ستتمكن من تفعيل المصادقة الثنائية لحماية حسابك بشكل أفضل.' 
                      : 'This feature will be available soon. You will be able to enable two-factor authentication for better account protection.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'معلومات الاشتراك' : 'Subscription Information'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'عرض وإدارة خطة اشتراكك.' 
                    : 'View and manage your subscription plan.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
                        </h3>
                        <p className="font-semibold dark:text-white">
                          {user?.subscription_tier 
                            ? user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1) 
                            : 'Free'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'تاريخ الانضمام' : 'Join Date'}
                        </h3>
                        <p className="font-semibold dark:text-white">
                          {format(new Date(), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'تاريخ انتهاء الاشتراك' : 'Expiration Date'}
                        </h3>
                        <p className="font-semibold dark:text-white">
                          {user?.subscription_tier === 'free' 
                            ? (language === 'ar' ? 'غير متاح' : 'N/A') 
                            : format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">
                      {language === 'ar' ? 'ترقية إلى خطة VIP' : 'Upgrade to VIP Plan'}
                    </h3>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="dark:text-white">
                          {language === 'ar' ? 'تحليلات متقدمة للتداول' : 'Advanced trading analytics'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="dark:text-white">
                          {language === 'ar' ? 'استراتيجيات متقدمة' : 'Advanced strategies'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="dark:text-white">
                          {language === 'ar' ? 'تنبيهات متقدمة' : 'Priority alerts'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="dark:text-white">
                          {language === 'ar' ? 'دعم على مدار الساعة' : '24/7 support'}
                        </span>
                      </li>
                    </ul>
                    <Button onClick={handleUpgradePlan} className="w-full justify-center">
                      {language === 'ar' ? 'ترقية الخطة الآن' : 'Upgrade Plan Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Management Tab */}
          <TabsContent value="account">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {language === 'ar' ? 'تسجيل الخروج من جميع الأجهزة' : 'Logout from All Devices'}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {language === 'ar' 
                    ? 'تسجيل الخروج من جميع الأجهزة التي قمت بتسجيل الدخول إليها.' 
                    : 'Logout from all devices where you have logged in.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                    {language === 'ar' 
                      ? 'سيؤدي هذا الإجراء إلى تسجيل خروجك من جميع الأجهزة، بما في ذلك هذا الجهاز. ستحتاج إلى تسجيل الدخول مرة أخرى.' 
                      : 'This action will log you out from all devices, including this one. You will need to log in again.'}
                  </p>
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
            
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">
                  {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'حذف حسابك بشكل دائم. لا يمكن التراجع عن هذا الإجراء.' 
                    : 'Permanently delete your account. This action cannot be undone.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {language === 'ar' 
                      ? 'سيؤدي حذف حسابك إلى إزالة جميع بياناتك وتفضيلاتك وسجلاتك بشكل دائم. لا يمكن التراجع عن هذا الإجراء.' 
                      : 'Deleting your account will permanently remove all your data, preferences, and records. This cannot be undone.'}
                  </p>
                  <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">
                          {language === 'ar' ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}
                        </DialogTitle>
                        <DialogDescription>
                          {language === 'ar' 
                            ? 'هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك.' 
                            : 'This action is final and cannot be undone. All your data will be deleted.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm mb-4">
                          {language === 'ar' 
                            ? 'لتأكيد الحذف، يرجى كتابة كلمة "DELETE" في الحقل أدناه:' 
                            : 'To confirm deletion, please type "DELETE" in the field below:'}
                        </p>
                        <Input 
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="mb-4"
                        />
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setDeleteConfirmOpen(false)}
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'DELETE'}
                        >
                          {language === 'ar' ? 'حذف الحساب نهائيًا' : 'Permanently Delete Account'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfileSettings;
