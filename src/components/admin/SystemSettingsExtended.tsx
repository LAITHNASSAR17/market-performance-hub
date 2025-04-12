
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, Save, Globe, Bell, Shield, Database, 
  DollarSign, Trash2, FileWarning, AlertTriangle, Server 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

const SystemSettingsExtended = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Retrieve site name from localStorage or use default
  const [siteName, setSiteName] = useState(() => {
    return localStorage.getItem('siteName') || 'TradeTracker';
  });
  
  const [dataRetention, setDataRetention] = useState(90);
  const [isPro, setIsPro] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const handleSaveSiteName = () => {
    // Save to localStorage
    localStorage.setItem('siteName', siteName);
    
    // Update document title
    document.title = siteName;
    
    toast({
      title: language === 'ar' ? "تم الحفظ" : "Saved",
      description: language === 'ar' 
        ? "تم تحديث اسم الموقع بنجاح" 
        : "Site name has been updated successfully"
    });
  };
  
  // Apply the site name to the document title when component mounts
  useEffect(() => {
    document.title = siteName;
  }, []);

  const handleSaveSettings = () => {
    toast({
      title: language === 'ar' ? "تم الحفظ" : "Saved",
      description: language === 'ar' 
        ? "تم حفظ الإعدادات بنجاح" 
        : "Settings have been saved successfully"
    });
  };

  const handleEnableMaintenanceMode = () => {
    setMaintenanceMode(true);
    toast({
      title: language === 'ar' ? "تم التفعيل" : "Enabled",
      description: language === 'ar' 
        ? "تم تفعيل وضع الصيانة" 
        : "Maintenance mode has been enabled",
      variant: "destructive"
    });
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="bg-card">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {language === 'ar' ? 'عام' : 'General'}
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {language === 'ar' ? 'المظهر' : 'Appearance'}
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {language === 'ar' ? 'الأمان' : 'Security'}
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          {language === 'ar' ? 'البيانات' : 'Data'}
        </TabsTrigger>
      </TabsList>

      {/* General Settings */}
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'اسم الموقع' : 'Site Name'}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'تغيير اسم الموقع الذي يظهر في علامة التبويب وواجهة المستخدم' 
                : 'Change the site name displayed in the browser tab and throughout the UI'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                value={siteName} 
                onChange={(e) => setSiteName(e.target.value)}
                placeholder={language === 'ar' ? 'اسم الموقع' : 'Site name'}
                className="flex-1"
              />
              <Button onClick={handleSaveSiteName}>
                <Save className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'التحديثات التلقائية' : 'Automatic Updates'}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'إدارة التحديثات التلقائية للنظام' 
                : 'Manage system automatic updates'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'تحديثات النظام' : 'System Updates'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'تمكين التحديثات التلقائية للنظام' 
                    : 'Enable automatic system updates'}
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'تحديثات الوظائف الإضافية' : 'Feature Updates'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'تحديث الميزات الجديدة تلقائيًا' 
                    : 'Automatically update new features'}
                </p>
              </div>
              <Switch checked={true} disabled={!isPro} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'إشعارات التحديث' : 'Update Notifications'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'إرسال إشعارات عند توفر تحديثات جديدة' 
                    : 'Send notifications when new updates are available'}
                </p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Appearance Settings */}
      <TabsContent value="appearance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'المظهر' : 'Appearance'}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'تخصيص مظهر لوحة المعلومات' 
                : 'Customize the dashboard appearance'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'الوضع المظلم / الفاتح' : 'Dark / Light Mode'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'تبديل بين الوضع المظلم والفاتح' 
                    : 'Toggle between dark and light mode'}
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'اللغة' : 'Language'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'اختر لغة واجهة المستخدم' 
                    : 'Choose UI language'}
                </p>
              </div>
              <LanguageToggle />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'إدارة إعدادات الأمان للنظام' 
                : 'Manage system security settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'قفل جلسات غير نشطة' : 'Lock Inactive Sessions'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'قفل الجلسات تلقائيًا بعد فترة من عدم النشاط' 
                    : 'Automatically lock sessions after a period of inactivity'}
                </p>
              </div>
              <Switch checked={true} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'تسجيل محاولات تسجيل الدخول الفاشلة' : 'Log Failed Login Attempts'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'تسجيل محاولات تسجيل الدخول الفاشلة للمراجعة' 
                    : 'Log failed login attempts for review'}
                </p>
              </div>
              <Switch checked={true} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'تتطلب المصادقة الثنائية لجميع المشرفين' 
                    : 'Require two-factor authentication for all admins'}
                </p>
              </div>
              <Switch checked={false} disabled={!isPro} />
            </div>

            {!isPro && (
              <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                {language === 'ar' 
                  ? 'ميزات أمان متقدمة متوفرة فقط في الخطة الاحترافية.' 
                  : 'Advanced security features are available only in Pro plan.'}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Data Management */}
      <TabsContent value="data" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'إدارة البيانات' : 'Data Management'}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'إدارة بيانات النظام والنسخ الاحتياطي' 
                : 'Manage system data and backups'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Automatic Backup'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'قم بتمكين النسخ الاحتياطي التلقائي للبيانات' 
                    : 'Enable automatic data backup'}
                </p>
              </div>
              <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} disabled={!isPro} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'فترة الاحتفاظ بالبيانات (بالأيام)' : 'Data Retention Period (days)'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'تعيين المدة التي يتم فيها الاحتفاظ بالبيانات قبل الحذف التلقائي' 
                    : 'Set how long data is retained before automatic deletion'}
                </p>
              </div>
              <Input 
                type="number" 
                className="w-24" 
                value={dataRetention} 
                onChange={(e) => setDataRetention(parseInt(e.target.value))} 
                min={1}
                max={365}
                disabled={!autoDeleteEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'حذف البيانات القديمة تلقائيًا' : 'Automatically Delete Old Data'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'حذف البيانات القديمة تلقائيًا بعد فترة الاحتفاظ' 
                    : 'Automatically delete old data after retention period'}
                </p>
              </div>
              <Switch checked={autoDeleteEnabled} onCheckedChange={setAutoDeleteEnabled} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Button variant="outline" className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'نسخ احتياطي الآن' : 'Backup Now'}
              </Button>
              
              <Button variant="destructive" className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'مسح كل البيانات' : 'Purge All Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'تمكين وضع الصيانة لمنع الوصول إلى النظام أثناء التحديثات' 
                : 'Enable maintenance mode to prevent access to the system during updates'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">
                    {language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'تمكين وضع الصيانة لإيقاف الوصول للمستخدمين مؤقتًا' 
                      : 'Enable maintenance mode to temporarily disable user access'}
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              {maintenanceMode && (
                <div className="bg-destructive/10 p-3 rounded-md text-sm flex items-start">
                  <FileWarning className="h-4 w-4 mr-2 text-destructive mt-0.5" />
                  <p className="text-destructive">
                    {language === 'ar' 
                      ? 'تحذير: عند تمكين وضع الصيانة، سيتم منع جميع المستخدمين باستثناء المشرفين من الوصول إلى النظام.' 
                      : 'Warning: When maintenance mode is enabled, all users except admins will be prevented from accessing the system.'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <Button 
                  disabled={maintenanceMode} 
                  onClick={handleEnableMaintenanceMode} 
                  variant="destructive" 
                  className="flex items-center"
                >
                  <Server className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تمكين وضع الصيانة' : 'Enable Maintenance Mode'}
                </Button>
                
                <Button 
                  disabled={!maintenanceMode} 
                  variant="outline" 
                  className="flex items-center"
                >
                  <Server className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تعطيل وضع الصيانة' : 'Disable Maintenance Mode'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          {language === 'ar' ? 'حفظ جميع الإعدادات' : 'Save All Settings'}
        </Button>
      </div>
    </Tabs>
  );
};

export default SystemSettingsExtended;
