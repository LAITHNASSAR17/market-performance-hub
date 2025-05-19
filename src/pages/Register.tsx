
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, AlertCircle, Mail, Lock, User, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/utils/countries';

const Register: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const { register, isAuthenticated, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword || !country) {
      setError('الرجاء إكمال جميع البيانات المطلوبة');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور ٦ أحرف على الأقل');
      return;
    }
    
    try {
      await register(name, email, password, country);
      
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'مرحباً بك في منصتنا',
      });
    } catch (err) {
      console.error('خطأ في إنشاء الحساب:', err);
      
      if ((err as Error).message?.includes('duplicate key value violates unique constraint')) {
        setError('البريد الإلكتروني مستخدم مسبقاً');
      } else {
        setError('حدث خطأ. الرجاء المحاولة مرة أخرى');
      }
      
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: 'يرجى المحاولة مرة أخرى لاحقاً',
        variant: "destructive",
      });
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg">
            <LineChart className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-center text-gray-600">
              انضم إلينا وابدأ رحلتك التداولية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <div className="flex items-center border border-gray-200 rounded-lg mt-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                    <User className="h-4 w-4 mx-3 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="flex items-center border border-gray-200 rounded-lg mt-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                    <Mail className="h-4 w-4 mx-3 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">الدولة</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-full mt-1.5 bg-white border-gray-200">
                      <div className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="اختر دولتك" />
                      </div>
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

                <div>
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="flex items-center border border-gray-200 rounded-lg mt-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                    <Lock className="h-4 w-4 mx-3 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="flex items-center border border-gray-200 rounded-lg mt-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                    <Lock className="h-4 w-4 mx-3 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="أعد إدخال كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
