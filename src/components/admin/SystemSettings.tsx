
import React from 'react';
import { Bell, Lock, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SystemSettings: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>الإعدادات العامة</CardTitle>
          <CardDescription>إدارة إعدادات النظام العامة</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">اسم الموقع</Label>
            <Input id="siteName" defaultValue="منصة سجل التداول" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">وصف الموقع</Label>
            <Input id="description" defaultValue="تتبع رحلة التداول الخاصة بك وتحسين أدائك" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowRegistration">السماح بتسجيل المستخدمين</Label>
              <p className="text-sm text-gray-500">تمكين أو تعطيل تسجيل المستخدمين الجدد</p>
            </div>
            <Switch id="allowRegistration" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenanceMode">وضع الصيانة</Label>
              <p className="text-sm text-gray-500">وضع الموقع في وضع الصيانة</p>
            </div>
            <Switch id="maintenanceMode" />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full">حفظ الإعدادات</Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>تكوين نظام الإشعارات</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">إشعارات البريد الإلكتروني</Label>
              <p className="text-sm text-gray-500">إرسال الإشعارات عبر البريد الإلكتروني</p>
            </div>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppNotifications">إشعارات داخل التطبيق</Label>
              <p className="text-sm text-gray-500">عرض الإشعارات داخل التطبيق</p>
            </div>
            <Switch id="inAppNotifications" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
            <Input id="welcomeMessage" defaultValue="مرحبًا بك في منصة سجل التداول!" />
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Bell className="mr-2 h-4 w-4" />
              إرسال إشعار تجريبي
            </Button>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full">حفظ إعدادات الإشعارات</Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-white shadow-sm md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>النسخ الاحتياطي والتصدير</CardTitle>
          <CardDescription>إنشاء وإدارة النسخ الاحتياطية للنظام</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <FileUp className="mr-2 h-4 w-4" />
              تصدير جميع المستخدمين
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <FileUp className="mr-2 h-4 w-4" />
              تصدير جميع الصفقات
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <FileUp className="mr-2 h-4 w-4" />
              تصدير جميع الملاحظات
            </Button>
          </div>
          
          <div className="pt-4">
            <Button className="w-full md:w-auto" variant="default">
              إنشاء نسخة احتياطية كاملة للنظام
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
