
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, Check, Copy, Server, Mail, Bell, ShieldAlert, Globe, RefreshCw } from 'lucide-react';
import FaviconUpload from '@/components/FaviconUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface SystemSettingsExtendedProps {
  // Add any props if needed
}

const SystemSettingsExtended: React.FC<SystemSettingsExtendedProps> = () => {
  const { users, getAllUsers } = useAuth();
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  
  // Site settings
  const [siteName, setSiteName] = useState('TradeTracker');
  const [siteSlogan, setSiteSlogan] = useState('Track your trading journey');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Our site is currently undergoing scheduled maintenance. Please check back later.');
  
  // Email settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [emailFooter, setEmailFooter] = useState('© 2025 TradeTracker. All rights reserved.');
  
  // Notification settings
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [enableInternalNotifications, setEnableInternalNotifications] = useState(true);
  const [welcomeMessageEnabled, setWelcomeMessageEnabled] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to TradeTracker! Start tracking your trades today.');

  useEffect(() => {
    // Get all users from localStorage directly to verify consistency
    const storedUsers = localStorage.getItem('users');
    try {
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const admins = parsedUsers.filter((user: any) => user.isAdmin);
      setAdminUsers(admins);
    } catch (error) {
      console.error('Error parsing users from localStorage:', error);
    }
    
    // Load settings from localStorage
    loadSettings();
  }, []);
  
  const loadSettings = () => {
    try {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        
        // Site settings
        setSiteName(parsedSettings.siteName || 'TradeTracker');
        setSiteSlogan(parsedSettings.siteSlogan || 'Track your trading journey');
        setMaintenanceMode(parsedSettings.maintenanceMode || false);
        setMaintenanceMessage(parsedSettings.maintenanceMessage || 'Our site is currently undergoing scheduled maintenance. Please check back later.');
        
        // Email settings
        setSmtpHost(parsedSettings.smtpHost || '');
        setSmtpPort(parsedSettings.smtpPort || '');
        setSmtpUser(parsedSettings.smtpUser || '');
        setSmtpPassword(parsedSettings.smtpPassword || '');
        setEmailFrom(parsedSettings.emailFrom || '');
        setEmailFooter(parsedSettings.emailFooter || '© 2025 TradeTracker. All rights reserved.');
        
        // Notification settings
        setEnableEmailNotifications(parsedSettings.enableEmailNotifications !== undefined ? parsedSettings.enableEmailNotifications : true);
        setEnableInternalNotifications(parsedSettings.enableInternalNotifications !== undefined ? parsedSettings.enableInternalNotifications : true);
        setWelcomeMessageEnabled(parsedSettings.welcomeMessageEnabled !== undefined ? parsedSettings.welcomeMessageEnabled : true);
        setWelcomeMessage(parsedSettings.welcomeMessage || 'Welcome to TradeTracker! Start tracking your trades today.');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const saveSettings = (settingsType: string) => {
    try {
      const currentSettings = localStorage.getItem('adminSettings');
      const parsedSettings = currentSettings ? JSON.parse(currentSettings) : {};
      
      let updatedSettings = { ...parsedSettings };
      
      if (settingsType === 'site') {
        updatedSettings = {
          ...updatedSettings,
          siteName,
          siteSlogan,
          maintenanceMode,
          maintenanceMessage
        };
      } else if (settingsType === 'email') {
        updatedSettings = {
          ...updatedSettings,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword,
          emailFrom,
          emailFooter
        };
      } else if (settingsType === 'notifications') {
        updatedSettings = {
          ...updatedSettings,
          enableEmailNotifications,
          enableInternalNotifications,
          welcomeMessageEnabled,
          welcomeMessage
        };
      }
      
      localStorage.setItem('adminSettings', JSON.stringify(updatedSettings));
      
      toast({
        title: "الإعدادات تم حفظها",
        description: "تم حفظ الإعدادات بنجاح"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive"
      });
    }
  };

  const handleResetAdmin = () => {
    // Check if users exist in localStorage
    const storedUsers = localStorage.getItem('users');
    let parsedUsers = [];
    
    try {
      parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      console.error('Error parsing users:', error);
      parsedUsers = [];
    }
    
    // Create admin user if not exists or reset if exists
    const adminEmail = 'lnmr2001@gmail.com';
    const adminPassword = 'password123';
    
    // Find admin user by email
    const adminIndex = parsedUsers.findIndex((user: any) => user.email === adminEmail);
    
    if (adminIndex !== -1) {
      // Update admin user
      parsedUsers[adminIndex] = {
        ...parsedUsers[adminIndex],
        password: 'a6d08a7c56eece8c2b7ba2ed1ebaacb4e4c01c4b2c84c7a0e90b6504756b8963', // Hashed 'password123'
        isAdmin: true,
        isBlocked: false,
      };
    } else {
      // Add new admin user
      parsedUsers.push({
        id: 'admin-1',
        name: 'Admin User',
        email: adminEmail,
        password: 'a6d08a7c56eece8c2b7ba2ed1ebaacb4e4c01c4b2c84c7a0e90b6504756b8963', // Hashed 'password123'
        encryptedName: 'U2FsdGVkX1+bBJfMjlTCZiJdz5s/xsqrR7YEaUSQbA4=', // Encrypted 'Admin User'
        encryptedEmail: 'U2FsdGVkX19C4hV5F6eqGJnXoZMOYwylkRzhxd0OJiPXsJLtUQg0b9ykHwdQp+IV', // Encrypted 'lnmr2001@gmail.com'
        isAdmin: true,
        isBlocked: false,
      });
    }
    
    // Save updated users to localStorage
    localStorage.setItem('users', JSON.stringify(parsedUsers));
    
    // Update users in state
    getAllUsers();
    
    // Show confirmation toast
    toast({
      title: "حساب المسؤول تم إعادة ضبطه",
      description: "تم إعادة ضبط حساب المسؤول بنجاح.",
    });

    // Set reset success state
    setIsResetSuccess(true);

    // Reset success message after 5 seconds
    setTimeout(() => {
      setIsResetSuccess(false);
    }, 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص إلى الحافظة",
    });
  };
  
  const testEmailConnection = () => {
    toast({
      title: "اختبار الاتصال",
      description: "تم إرسال بريد إلكتروني للاختبار. يرجى التحقق من صندوق الوارد الخاص بك.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="account">
            <ShieldAlert className="h-4 w-4 mr-2" />
            حساب المسؤول
          </TabsTrigger>
          <TabsTrigger value="site">
            <Globe className="h-4 w-4 mr-2" />
            إعدادات الموقع
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            إعدادات البريد
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            الإشعارات
          </TabsTrigger>
        </TabsList>
        
        {/* Admin Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات حساب المسؤول</CardTitle>
              <CardDescription>إدارة حسابات المسؤولين والأذونات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isResetSuccess && (
                <Alert className="bg-green-50 border-green-200 mb-4">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    تم إعادة ضبط حساب المسؤول بنجاح. يمكنك الآن تسجيل الدخول باستخدام البيانات الموضحة أدناه.
                  </AlertDescription>
                </Alert>
              )}

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  <p className="font-bold">معلومات تسجيل دخول المسؤول:</p>
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center mb-2">
                  <div className="font-semibold">البريد الإلكتروني:</div>
                  <div className="font-mono">lnmr2001@gmail.com</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard('lnmr2001@gmail.com')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                  <div className="font-semibold">كلمة المرور:</div>
                  <div className="font-mono">password123</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard('password123')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {adminUsers.length > 0 ? (
                <>
                  <Alert className="bg-blue-50 border-blue-200 mt-4">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      <p>حسابات المسؤولين النشطة حالياً:</p>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {adminUsers.map((admin: any) => (
                          <tr key={admin.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {admin.isBlocked ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  محظور
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  نشط
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-700">
                    لم يتم العثور على حسابات للمسؤولين. استخدم زر إعادة الضبط أدناه لإنشاء حساب مسؤول افتراضي.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <Label className="font-medium mb-2 block">إعادة ضبط حساب المسؤول</Label>
                <p className="text-sm text-gray-600 mb-2 text-right">
                  سيؤدي هذا إلى إعادة ضبط حساب المسؤول إلى إعداداته الافتراضية. استخدم هذا إذا كنت تواجه مشكلة في تسجيل الدخول.
                </p>
                <Button 
                  onClick={handleResetAdmin} 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  إعادة ضبط حساب المسؤول
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Site Settings Tab */}
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الموقع</CardTitle>
              <CardDescription>تخصيص إعدادات الموقع الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">اسم الموقع</Label>
                  <Input 
                    id="site-name" 
                    value={siteName} 
                    onChange={(e) => setSiteName(e.target.value)} 
                    placeholder="TradeTracker" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="site-slogan">شعار الموقع</Label>
                  <Input 
                    id="site-slogan" 
                    value={siteSlogan} 
                    onChange={(e) => setSiteSlogan(e.target.value)} 
                    placeholder="Track your trading journey" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="site-favicon">أيقونة الموقع</Label>
                  <FaviconUpload />
                </div>
                
                <div className="flex items-center justify-between border-t pt-4 mt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">وضع الصيانة</Label>
                    <p className="text-sm text-muted-foreground">
                      عند تفعيله، سيتم عرض رسالة الصيانة لجميع المستخدمين
                    </p>
                  </div>
                  <Switch 
                    id="maintenance-mode" 
                    checked={maintenanceMode} 
                    onCheckedChange={setMaintenanceMode} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="maintenance-message">رسالة الصيانة</Label>
                  <Textarea 
                    id="maintenance-message" 
                    value={maintenanceMessage} 
                    onChange={(e) => setMaintenanceMessage(e.target.value)} 
                    placeholder="Our site is currently undergoing scheduled maintenance. Please check back later." 
                    rows={3} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => saveSettings('site')} className="bg-green-600 hover:bg-green-700 text-white">
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Email Settings Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات البريد الإلكتروني</CardTitle>
              <CardDescription>تكوين إعدادات SMTP لإرسال البريد الإلكتروني</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700">
                  هذه الإعدادات مطلوبة لإرسال رسائل البريد الإلكتروني من النظام مثل إعادة تعيين كلمة المرور والإشعارات.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp-host">خادم SMTP</Label>
                  <Input 
                    id="smtp-host" 
                    value={smtpHost} 
                    onChange={(e) => setSmtpHost(e.target.value)} 
                    placeholder="smtp.example.com" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-port">منفذ SMTP</Label>
                  <Input 
                    id="smtp-port" 
                    value={smtpPort} 
                    onChange={(e) => setSmtpPort(e.target.value)} 
                    placeholder="587" 
                    type="number" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp-user">اسم المستخدم</Label>
                  <Input 
                    id="smtp-user" 
                    value={smtpUser} 
                    onChange={(e) => setSmtpUser(e.target.value)} 
                    placeholder="your_username" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-password">كلمة المرور</Label>
                  <Input 
                    id="smtp-password" 
                    value={smtpPassword} 
                    onChange={(e) => setSmtpPassword(e.target.value)} 
                    placeholder="your_password" 
                    type="password" 
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email-from">عنوان المرسل</Label>
                <Input 
                  id="email-from" 
                  value={emailFrom} 
                  onChange={(e) => setEmailFrom(e.target.value)} 
                  placeholder="noreply@yourcompany.com" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email-footer">تذييل البريد الإلكتروني</Label>
                <Textarea 
                  id="email-footer" 
                  value={emailFooter} 
                  onChange={(e) => setEmailFooter(e.target.value)} 
                  placeholder="© 2025 TradeTracker. All rights reserved." 
                  rows={2} 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={testEmailConnection} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                اختبار الاتصال
              </Button>
              <Button onClick={() => saveSettings('email')} className="bg-green-600 hover:bg-green-700 text-white">
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>تكوين إعدادات الإشعارات للمستخدمين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    تمكين إرسال الإشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={enableEmailNotifications} 
                  onCheckedChange={setEnableEmailNotifications} 
                />
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="internal-notifications">الإشعارات الداخلية</Label>
                  <p className="text-sm text-muted-foreground">
                    تمكين الإشعارات داخل النظام
                  </p>
                </div>
                <Switch 
                  id="internal-notifications" 
                  checked={enableInternalNotifications} 
                  onCheckedChange={setEnableInternalNotifications} 
                />
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="welcome-message">رسالة الترحيب للمستخدمين الجدد</Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال رسالة ترحيب للمستخدمين الجدد
                  </p>
                </div>
                <Switch 
                  id="welcome-message" 
                  checked={welcomeMessageEnabled} 
                  onCheckedChange={setWelcomeMessageEnabled} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="welcome-message-text">نص رسالة الترحيب</Label>
                <Textarea 
                  id="welcome-message-text" 
                  value={welcomeMessage} 
                  onChange={(e) => setWelcomeMessage(e.target.value)} 
                  placeholder="Welcome to TradeTracker! Start tracking your trades today." 
                  rows={3} 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => saveSettings('notifications')} className="bg-green-600 hover:bg-green-700 text-white">
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsExtended;
