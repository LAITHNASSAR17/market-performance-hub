
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Mail, LockKeyhole, AlertCircle, CheckCircle2, InfoIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [connectionError, setConnectionError] = useState(false);

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
      setError('الرجاء إدخال بريدك الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setConnectionError(false);
    
    try {
      console.log('Login page: Starting login for', email);
      await login(email, password);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك مرة أخرى!",
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "فشل تسجيل الدخول. الرجاء التحقق من بريدك الإلكتروني وكلمة المرور.";
      
      // Check for connection errors
      if (error.message === 'Failed to fetch' || error.name === 'AuthRetryableFetchError') {
        setConnectionError(true);
        errorMessage = "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
      } else if (error.message === 'Invalid credentials' || error.message === 'Invalid login credentials') {
        errorMessage = "بريد إلكتروني أو كلمة مرور غير صحيحة";
      } else if (error.message === 'User is blocked') {
        errorMessage = "تم حظر هذا الحساب. الرجاء الاتصال بالدعم.";
      } else if (error.message === 'Email is not activated') {
        errorMessage = "البريد الإلكتروني غير مفعل. يرجى التحقق من بريدك الإلكتروني لتنشيط حسابك.";
      }
      
      setError(errorMessage);
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

  const setAdminCredentials = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  // Enhanced bypass login for development mode
  const handleBypassLogin = () => {
    localStorage.setItem('bypass_auth', 'true');
    localStorage.setItem('dev_mode_user', JSON.stringify({
      id: 'dev-user-123',
      name: 'Development User',
      email: 'dev@example.com',
      role: 'admin',
      isAdmin: true,
      subscription_tier: 'premium'
    }));
    console.log('Bypassing authentication in development mode');
    toast({
      title: "وضع التطوير",
      description: "تم تسجيل الدخول في وضع التطوير بنجاح!",
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
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
              أدخل بيانات اعتمادك للوصول إلى حسابك
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

            {connectionError && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <InfoIcon className="h-4 w-4 text-yellow-600" />
                <div className="flex flex-col">
                  <AlertDescription className="text-yellow-700 mb-2">
                    هناك مشكلة في الاتصال بالخادم. يمكنك المتابعة في وضع التطوير المحلي.
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-400 text-yellow-700 hover:bg-yellow-100 self-start"
                    onClick={handleBypassLogin}
                  >
                    المتابعة دون تسجيل الدخول (وضع التطوير فقط)
                  </Button>
                </div>
              </Alert>
            )}
            
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                يمكنك استخدام حساب المدير: 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-blue-600 mx-1" 
                  onClick={setAdminCredentials}
                  type="button"
                >
                  (اضغط لملء البيانات)
                </Button>
                <br />
                البريد: admin@example.com | كلمة المرور: admin123
              </AlertDescription>
            </Alert>
            
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
                disabled={loading || isLoading}
              >
                {loading || isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
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
    </div>
  );
};

export default Login;
