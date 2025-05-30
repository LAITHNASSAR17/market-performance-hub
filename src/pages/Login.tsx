
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Mail, LockKeyhole, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/toaster';
import { createTestAccount } from '@/services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [debug, setDebug] = useState<string>('');
  const [testAccountCreated, setTestAccountCreated] = useState(false);

  // Try to create test account when page loads
  useEffect(() => {
    const setupTestAccount = async () => {
      try {
        await createTestAccount();
        setTestAccountCreated(true);
        console.log('تمت محاولة إنشاء حساب اختباري');
      } catch (err) {
        console.error('خطأ أثناء إنشاء حساب اختباري:', err);
      }
    };
    
    setupTestAccount();
  }, []);

  useEffect(() => {
    if (location.state?.verified) {
      setSuccessMessage(location.state.message || "تم التحقق من بريدك الإلكتروني بنجاح.");
      setEmail(location.state.email || "");
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      const intendedPath = location.state?.from || '/dashboard';
      
      if (intendedPath !== '/login' && intendedPath !== '/') {
        localStorage.setItem('last_path', intendedPath);
      }
      
      navigate(intendedPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setDebug('');
    
    try {
      console.log('Login page: Starting login for', email);
      setDebug(`محاولة تسجيل الدخول باستخدام: ${email}`);
      
      await login(email, password);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك!",
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "فشل تسجيل الدخول. الرجاء التحقق من بريدك الإلكتروني وكلمة المرور.";
      
      if (error.message === 'Invalid credentials') {
        errorMessage = "بريد إلكتروني أو كلمة مرور غير صحيحة";
      } else if (error.message === 'User is blocked') {
        errorMessage = "تم حظر هذا الحساب. الرجاء الاتصال بالدعم.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        errorMessage = "خطأ في الاتصال بالخادم. الرجاء المحاولة لاحقًا.";
      }
      
      setError(errorMessage);
      setDebug(`خطأ: ${error.message}`);
      
      toast({
        title: "فشل تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Login page: Navigating to forgot password page');
    navigate('/forgot-password');
  };

  const fillTestCredentials = () => {
    setEmail('test@example.com');
    setPassword('123456');
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
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <Mail className="h-4 w-4 mx-3 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-blue-600" 
                    onClick={handleForgotPassword}
                    type="button"
                  >
                    نسيت كلمة المرور؟
                  </Button>
                </div>
                <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <LockKeyhole className="h-4 w-4 mx-3 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
              
              <div className="mt-3 text-center">
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs"
                  onClick={fillTestCredentials}
                >
                  استخدام حساب اختباري
                </Button>
                {testAccountCreated && (
                  <div className="mt-2 text-xs text-green-600">
                    تم إنشاء حساب اختباري جاهز للاستخدام
                  </div>
                )}
              </div>
            </form>
            
            {debug && (
              <div className="mt-4 p-2 bg-gray-100 text-xs text-gray-500 rounded-md">
                <p className="font-mono">{debug}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                إنشاء حساب
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default Login;
