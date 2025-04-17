
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, Moon, Sun, Languages, User, Lock, Database, Loader2, Shield } from 'lucide-react';
import FaviconUpload from '@/components/FaviconUpload';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [siteName, setSiteName] = React.useState(document.title || "TrackMind");

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteName(e.target.value);
  };

  const updateSiteName = () => {
    setIsLoading(true);
    
    try {
      localStorage.setItem('siteName', siteName);
      document.title = siteName;
      
      toast({
        title: "تم تحديث اسم الموقع",
        description: "تم تغيير اسم الموقع بنجاح."
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث اسم الموقع.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-gray-500">إدارة إعدادات حسابك وتفضيلاتك</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-4 grid grid-cols-4 md:grid-cols-5 gap-2">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                الحساب
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Sun className="h-4 w-4 mr-2" />
                المظهر
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Database className="h-4 w-4 mr-2" />
                الربط والتكامل
              </TabsTrigger>
              <TabsTrigger value="language">
                <Languages className="h-4 w-4 mr-2" />
                اللغة
              </TabsTrigger>
              <TabsTrigger value="security" className="hidden md:flex">
                <Shield className="h-4 w-4 mr-2" />
                الأمان
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الحساب</CardTitle>
                  <CardDescription>
                    عرض وتعديل معلومات حسابك الشخصية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">اسم الموقع</Label>
                    <div className="flex gap-2">
                      <input
                        id="siteName"
                        value={siteName}
                        onChange={handleSiteNameChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="اسم الموقع الخاص بك"
                      />
                      <Button onClick={updateSiteName} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <FaviconUpload />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/profile-settings')}>
                    إعدادات الملف الشخصي
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => logout()}>
                    تسجيل الخروج
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>المظهر</CardTitle>
                  <CardDescription>
                    تخصيص مظهر التطبيق حسب تفضيلاتك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-5 w-5 ml-2" />
                      <div>
                        <Label htmlFor="theme-mode">الوضع الداكن</Label>
                        <p className="text-sm text-gray-500">
                          تبديل بين المظهر الفاتح والداكن
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="theme-mode"
                      checked={theme === "dark"}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>الربط والتكامل</CardTitle>
                  <CardDescription>
                    اتصل بخدمات خارجية واستورد البيانات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium mb-1">ربط MetaTrader</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          قم بتوصيل حساب MetaTrader 4 أو 5 لاستيراد صفقاتك تلقائيًا
                        </p>
                        <Button onClick={() => navigate('/metatrader-connect')}>
                          إعداد الاتصال
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 h-16 w-16 flex items-center justify-center rounded-lg">
                        <span className="text-xl font-bold">MT</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات اللغة</CardTitle>
                  <CardDescription>
                    اختر اللغة المفضلة لديك للتطبيق
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="language">اللغة</Label>
                      <select
                        id="language"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="ar"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>الأمان</CardTitle>
                  <CardDescription>
                    إدارة إعدادات الأمان وكلمة المرور
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Lock className="mr-2 h-4 w-4" />
                    تغيير كلمة المرور
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
