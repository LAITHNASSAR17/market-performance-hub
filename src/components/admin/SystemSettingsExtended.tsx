
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, Check, Copy } from 'lucide-react';
import FaviconUpload from '@/components/FaviconUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SystemSettingsExtendedProps {
  // Add any props if needed
}

const SystemSettingsExtended: React.FC<SystemSettingsExtendedProps> = () => {
  const { users, getAllUsers } = useAuth();
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

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
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Favicon Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات أيقونة الموقع</CardTitle>
          <CardDescription>تحميل وإدارة أيقونة الموقع</CardDescription>
        </CardHeader>
        <CardContent>
          <FaviconUpload />
        </CardContent>
      </Card>

      {/* Admin Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>حسابات المسؤولين</CardTitle>
          <CardDescription>عرض وإدارة حسابات المسؤولين</CardDescription>
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
          
          <div className="mt-4 pt-4 border-t flex flex-col space-y-2">
            <Label className="font-medium">إعادة ضبط حساب المسؤول</Label>
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
    </div>
  );
};

export default SystemSettingsExtended;
