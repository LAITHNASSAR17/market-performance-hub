
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, AlertCircle, Mail, Lock, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال عنوان بريد إلكتروني صالح" }),
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال عنوان بريد إلكتروني صالح" }),
  resetCode: z.string().min(6, { message: "يجب أن يتكون رمز إعادة التعيين من 6 أرقام" }),
  newPassword: z.string().min(6, { message: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" }),
  confirmPassword: z.string().min(6, { message: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading, forgotPassword, resetPassword } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  // Clear localStorage if URL has a clear param (for debugging purposes)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('clear')) {
      console.log('تم مسح التخزين المحلي بسبب معلمة ?clear');
      localStorage.clear();
      window.location.href = window.location.pathname;
    }
  }, []);

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    
    try {
      await login(email, password);
    } catch (err) {
      setError('فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.');
    }
  };

  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await forgotPassword(values.email);
      setForgotPasswordOpen(false);
      setResetPasswordOpen(true);
      resetPasswordForm.setValue("email", values.email);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const onResetPasswordSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      await resetPassword(values.email, values.resetCode, values.newPassword);
      setResetPasswordOpen(false);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

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
            <CardTitle className="text-center">منصة أداء التداول</CardTitle>
            <CardDescription className="text-center">
              سجل الدخول للوصول إلى لوحة التحكم الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
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
              
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-xs p-0 h-auto"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    نسيت كلمة المرور؟
                  </Button>
                </div>
                <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <Lock className="h-4 w-4 mx-3 text-gray-500" />
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
                className="w-full"
                disabled={loading}
              >
                {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                التسجيل
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* نافذة نسيت كلمة المرور */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نسيت كلمة المرور</DialogTitle>
            <DialogDescription>
              أدخل عنوان بريدك الإلكتروني وسنرسل لك رمز إعادة التعيين.
            </DialogDescription>
          </DialogHeader>
          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Mail className="h-4 w-4 mx-3 text-gray-500" />
                        <Input placeholder="أدخل بريدك الإلكتروني" {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setForgotPasswordOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'جارٍ الإرسال...' : 'إرسال رمز إعادة التعيين'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* نافذة إعادة تعيين كلمة المرور */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription>
              أدخل الرمز المرسل إلى بريدك الإلكتروني وأنشئ كلمة مرور جديدة.
            </DialogDescription>
          </DialogHeader>
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Mail className="h-4 w-4 mx-3 text-gray-500" />
                        <Input placeholder="أدخل بريدك الإلكتروني" {...field} readOnly className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="resetCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز إعادة التعيين</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Key className="h-4 w-4 mx-3 text-gray-500" />
                        <Input placeholder="أدخل الرمز المكون من 6 أرقام" {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Lock className="h-4 w-4 mx-3 text-gray-500" />
                        <Input type="password" placeholder="أدخل كلمة المرور الجديدة" {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Lock className="h-4 w-4 mx-3 text-gray-500" />
                        <Input type="password" placeholder="تأكيد كلمة المرور الجديدة" {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetPasswordOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'جارٍ إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
