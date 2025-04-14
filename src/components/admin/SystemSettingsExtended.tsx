import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, Save, Globe, Bell, Shield, Database, DollarSign, Trash2, FileWarning, AlertTriangle, Server, FileText, LockKeyhole, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { supabase } from '@/lib/supabase';
const SystemSettingsExtended = () => {
  const {
    toast
  } = useToast();
  const {
    t,
    language
  } = useLanguage();

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

  // Security settings
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [logFailedLogins, setLogFailedLogins] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Integration settings
  const [apiKeysVisible, setApiKeysVisible] = useState(false);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiEnabled, setApiEnabled] = useState(true);

  // Load settings from Supabase on component mount
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('site_settings').select('*').single();
        if (error) {
          console.error('Error loading site settings:', error);
          return;
        }
        if (data) {
          // Update site name in state and localStorage
          setSiteName(data.site_name);
          localStorage.setItem('siteName', data.site_name);

          // Update document title
          document.title = data.site_name;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    loadSiteSettings();
  }, []);
  const handleSaveSiteName = async () => {
    try {
      // Save to Supabase
      const {
        data,
        error
      } = await supabase.from('site_settings').update({
        site_name: siteName
      }).eq('site_name', localStorage.getItem('siteName')).select();
      if (error) {
        throw error;
      }

      // Update localStorage
      localStorage.setItem('siteName', siteName);

      // Update document title
      document.title = siteName;
      toast({
        title: language === 'ar' ? "تم الحفظ" : "Saved",
        description: language === 'ar' ? "تم تحديث اسم الموقع بنجاح" : "Site name has been updated successfully"
      });
    } catch (error) {
      console.error('Error saving site name:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حدث خطأ أثناء حفظ اسم الموقع" : "An error occurred while saving the site name",
        variant: "destructive"
      });
    }
  };

  // Apply the site name to the document title when component mounts
  useEffect(() => {
    document.title = siteName;
  }, [siteName]);
  const handleSaveSettings = async () => {
    try {
      // Save security settings to database
      const securitySettings = {
        auto_lock_enabled: autoLockEnabled,
        log_failed_logins: logFailedLogins,
        two_factor_auth: twoFactorAuth
      };

      // Save integration settings
      const integrationSettings = {
        google_analytics_id: googleAnalyticsId,
        webhook_url: webhookUrl,
        api_enabled: apiEnabled
      };

      // Here you would save these settings to your database
      // For demo purposes, we'll just show a toast message

      toast({
        title: language === 'ar' ? "تم الحفظ" : "Saved",
        description: language === 'ar' ? "تم حفظ الإعدادات بنجاح" : "Settings have been saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حدث خطأ أثناء حفظ الإعدادات" : "An error occurred while saving settings",
        variant: "destructive"
      });
    }
  };
  const handleEnableMaintenanceMode = () => {
    setMaintenanceMode(true);
    toast({
      title: language === 'ar' ? "تم التفعيل" : "Enabled",
      description: language === 'ar' ? "تم تفعيل وضع الصيانة" : "Maintenance mode has been enabled",
      variant: "destructive"
    });
  };
  return <Tabs defaultValue="general" className="space-y-4">
      

      {/* General Settings */}
      

      {/* Appearance Settings */}
      <TabsContent value="appearance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'المظهر' : 'Appearance'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'تخصيص مظهر لوحة المعلومات' : 'Customize the dashboard appearance'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'الوضع المظلم / الفاتح' : 'Dark / Light Mode'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'تبديل بين الوضع المظلم والفاتح' : 'Toggle between dark and light mode'}
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
                  {language === 'ar' ? 'اختر لغة واجهة المستخدم' : 'Choose UI language'}
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
              {language === 'ar' ? 'إدارة إعدادات الأمان للنظام' : 'Manage system security settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'قفل جلسات غير نشطة' : 'Lock Inactive Sessions'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'قفل الجلسات تلقائيًا بعد فترة من عدم النشاط' : 'Automatically lock sessions after a period of inactivity'}
                </p>
              </div>
              <Switch checked={autoLockEnabled} onCheckedChange={setAutoLockEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'تسجيل محاولات تسجيل الدخول الفاشلة' : 'Log Failed Login Attempts'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'تسجيل محاولات تسجيل الدخول الفاشلة للمراجعة' : 'Log failed login attempts for review'}
                </p>
              </div>
              <Switch checked={logFailedLogins} onCheckedChange={setLogFailedLogins} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'تتطلب المصادقة الثنائية لجميع المشرفين' : 'Require two-factor authentication for all admins'}
                </p>
              </div>
              <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} disabled={!isPro} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'إدارة كلمات المرور' : 'Password Management'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'تعيين سياسات كلمة المرور القوية' : 'Set strong password policies'}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Lock className="h-4 w-4" />
                {language === 'ar' ? 'إدارة' : 'Manage'}
              </Button>
            </div>

            {!isPro && <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                {language === 'ar' ? 'ميزات أمان متقدمة متوفرة فقط في الخطة الاحترافية.' : 'Advanced security features are available only in Pro plan.'}
              </div>}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Data Management */}
      <TabsContent value="data" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'إدارة البيانات' : 'Data Management'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'إدارة بيانات النظام والنسخ الاحتياطي' : 'Manage system data and backups'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Automatic Backup'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'قم بتمكين النسخ الاحتياطي التلقائي للبيانات' : 'Enable automatic data backup'}
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
                  {language === 'ar' ? 'تعيين المدة التي يتم فيها الاحتفاظ بالبيانات قبل الحذف التلقائي' : 'Set how long data is retained before automatic deletion'}
                </p>
              </div>
              <Input type="number" className="w-24" value={dataRetention} onChange={e => setDataRetention(parseInt(e.target.value))} min={1} max={365} disabled={!autoDeleteEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'حذف البيانات القديمة تلقائيًا' : 'Automatically Delete Old Data'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'حذف البيانات القديمة تلقائيًا بعد فترة الاحتفاظ' : 'Automatically delete old data after retention period'}
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
              {language === 'ar' ? 'تمكين وضع الصيانة لمنع الوصول إلى النظام أثناء التحديثات' : 'Enable maintenance mode to prevent access to the system during updates'}
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
                    {language === 'ar' ? 'تمكين وضع الصيانة لإيقاف الوصول للمستخدمين مؤقتًا' : 'Enable maintenance mode to temporarily disable user access'}
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              {maintenanceMode && <div className="bg-destructive/10 p-3 rounded-md text-sm flex items-start">
                  <FileWarning className="h-4 w-4 mr-2 text-destructive mt-0.5" />
                  <p className="text-destructive">
                    {language === 'ar' ? 'تحذير: عند تمكين وضع الصيانة، سيتم منع جميع المستخدمين باستثناء المشرفين من الوصول إلى النظام.' : 'Warning: When maintenance mode is enabled, all users except admins will be prevented from accessing the system.'}
                  </p>
                </div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <Button disabled={maintenanceMode} onClick={handleEnableMaintenanceMode} variant="destructive" className="flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تمكين وضع الصيانة' : 'Enable Maintenance Mode'}
                </Button>
                
                <Button disabled={!maintenanceMode} variant="outline" className="flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تعطيل وضع الصيانة' : 'Disable Maintenance Mode'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Integrations Tab */}
      <TabsContent value="integrations" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'واجهة برمجة التطبيقات' : 'API Configuration'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'إدارة إعدادات واجهة برمجة التطبيقات وإمكانية الوصول' : 'Manage API settings and accessibility'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === 'ar' ? 'تمكين واجهة API' : 'Enable API'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'السماح بالوصول إلى واجهة برمجة التطبيقات من التطبيقات الخارجية' : 'Allow API access from external applications'}
                </p>
              </div>
              <Switch checked={apiEnabled} onCheckedChange={setApiEnabled} />
            </div>

            <div className="p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">
                    {language === 'ar' ? 'مفتاح API' : 'API Key'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'مفتاح واجهة برمجة التطبيقات الرئيسي للمصادقة' : 'Primary API key for authentication'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setApiKeysVisible(!apiKeysVisible)}>
                  {apiKeysVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="relative">
                <Input type={apiKeysVisible ? "text" : "password"} value="sk_live_51M8JkHKXCJJ7SsR2m6NtIdC0X3G" readOnly className="font-mono bg-muted" />
                <Button className="absolute right-1 top-1 h-6" variant="ghost" size="sm" onClick={() => {
                navigator.clipboard.writeText("sk_live_51M8JkHKXCJJ7SsR2m6NtIdC0X3G");
                toast({
                  title: "Copied!",
                  description: "API key copied to clipboard"
                });
              }}>
                  Copy
                </Button>
              </div>
              
              <div className="text-sm">
                <Button variant="outline" size="sm" className="mt-2">
                  {language === 'ar' ? 'إعادة توليد المفتاح' : 'Regenerate Key'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'ar' ? 'تحذير: ستحتاج إلى تحديث التكاملات التي تستخدم هذا المفتاح.' : 'Warning: You will need to update integrations using this key.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="ga-id">
                  {language === 'ar' ? 'معرف Google Analytics' : 'Google Analytics ID'}
                </Label>
                <Input id="ga-id" value={googleAnalyticsId} onChange={e => setGoogleAnalyticsId(e.target.value)} placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="webhook-url">
                  {language === 'ar' ? 'رابط Webhook' : 'Webhook URL'}
                </Label>
                <Input id="webhook-url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhook" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ar' ? 'سيتم إرسال إشعارات الأحداث المهمة إلى هذا الرابط.' : 'Important event notifications will be sent to this URL.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      
    </Tabs>;
};
export default SystemSettingsExtended;