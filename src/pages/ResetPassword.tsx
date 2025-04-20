
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, LockKeyhole, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResetPassword: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { changePassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Parse email from URL query parameters
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      console.log('ResetPassword: Email from URL:', emailParam);
    } else {
      setError('البريد الإلكتروني غير متوفر في الرابط');
      console.error('ResetPassword: No email provided in URL');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }

    if (!password) {
      setError('كلمة المرور مطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
      return;
    }

    setLoading(true);
    try {
      console.log('ResetPassword: Resetting password for email:', email);
      await changePassword(email, password);
      console.log('ResetPassword: Password reset successful');
      
      setSuccess(true);
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('ResetPassword: Error:', error);
      setError('فشل في تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
      toast({
        title: "خطأ",
        description: "فشل في تغيير كلمة المرور. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-500 p-3 rounded-full">
            <LineChart className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription>
              {success 
                ? "تم تغيير كلمة المرور بنجاح. سيتم تحويلك إلى صفحة تسجيل الدخول..."
                : "الرجاء إدخال كلمة المرور الجديدة"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!success ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="password">كلمة المرور الجديدة</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <LockKeyhole className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="أدخل كلمة المرور الجديدة"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <LockKeyhole className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'جاري المعالجة...' : 'إعادة تعيين كلمة المرور'}
                </Button>
              </form>
            ) : (
              <div className="text-center p-4">
                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                  تم تغيير كلمة المرور بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول...
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              هل تريد العودة إلى{' '}
              <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
