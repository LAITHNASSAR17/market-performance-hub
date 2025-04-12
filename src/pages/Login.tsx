import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, AlertCircle, Mail, Lock, Key, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import LanguageToggle from '@/components/LanguageToggle';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

const Login: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const { login, isAuthenticated, loading, forgotPassword, resetPassword } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('clear')) {
      console.log('localStorage cleared due to ?clear parameter');
      localStorage.clear();
      window.location.href = window.location.pathname;
    }
  }, []);

  useEffect(() => {
    const users = localStorage.getItem('users');
    if (users && JSON.parse(users).length > 0) {
      const adminUser = JSON.parse(users).find((u: any) => u.isAdmin);
      if (adminUser) {
        setShowCredentials(true);
      }
    }
  }, []);

  const forgotPasswordSchema = z.object({
    email: z.string().email({ message: t('login.error.invalidEmail') }),
  });

  const resetPasswordSchema = z.object({
    email: z.string().email({ message: t('login.error.invalidEmail') }),
    resetCode: z.string().min(6, { message: t('resetPassword.error.codeLength') }),
    newPassword: z.string().min(6, { message: t('resetPassword.error.passwordLength') }),
    confirmPassword: z.string().min(6, { message: t('resetPassword.error.passwordLength') }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('resetPassword.error.passwordMismatch'),
    path: ["confirmPassword"],
  });

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
      setError(t('login.error.emptyFields'));
      return;
    }
    
    try {
      await login(email, password);
    } catch (err) {
      setError(t('login.error.credentials'));
    }
  };

  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await forgotPassword(values.email);
      setForgotPasswordOpen(false);
      setResetPasswordOpen(true);
      resetPasswordForm.setValue("email", values.email);
    } catch (error) {
    }
  };

  const onResetPasswordSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      await resetPassword(values.email, values.resetCode, values.newPassword);
      setResetPasswordOpen(false);
    } catch (error) {
    }
  };

  const fillDemoCredentials = () => {
    setEmail('lnmr2001@gmail.com');
    setPassword('password123');
    toast({
      title: "Demo Credentials Filled",
      description: "You can now click login to access the admin dashboard",
    });
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 relative">
            <div className="bg-blue-500 p-3 rounded-full">
              <LineChart className="h-8 w-8 text-white" />
            </div>
            <div className="absolute top-0 right-0">
              <LanguageToggle />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t('login.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('login.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showCredentials && (
                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    <p>Admin account: <strong>lnmr2001@gmail.com</strong></p>
                    <p>Password: <strong>password123</strong></p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs bg-blue-100 border-blue-300"
                      onClick={fillDemoCredentials}
                    >
                      Use Demo Credentials
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <div className="mb-4">
                  <Label htmlFor="email">{t('login.email')}</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Mail className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('login.email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('login.password')}</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-xs p-0 h-auto"
                      onClick={() => setForgotPasswordOpen(true)}
                    >
                      {t('login.forgotPassword')}
                    </Button>
                  </div>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Lock className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('login.password')}
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
                  {loading ? t('login.loggingIn') : t('login.loginButton')}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                {t('login.noAccount')}{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  {t('login.register')}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('forgotPassword.title')}</DialogTitle>
              <DialogDescription>
                {t('forgotPassword.description')}
              </DialogDescription>
            </DialogHeader>
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('login.email')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <Mail className="h-4 w-4 mx-3 text-gray-500" />
                          <Input placeholder={t('login.email')} {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setForgotPasswordOpen(false)}>
                    {t('forgotPassword.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? t('forgotPassword.sending') : t('forgotPassword.button')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('resetPassword.title')}</DialogTitle>
              <DialogDescription>
                {t('resetPassword.description')}
              </DialogDescription>
            </DialogHeader>
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('login.email')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <Mail className="h-4 w-4 mx-3 text-gray-500" />
                          <Input placeholder={t('login.email')} {...field} readOnly className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
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
                      <FormLabel>{t('resetPassword.code')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <Key className="h-4 w-4 mx-3 text-gray-500" />
                          <Input placeholder={t('resetPassword.code')} {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
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
                      <FormLabel>{t('resetPassword.newPassword')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <Lock className="h-4 w-4 mx-3 text-gray-500" />
                          <Input type="password" placeholder={t('resetPassword.newPassword')} {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
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
                      <FormLabel>{t('resetPassword.confirmPassword')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <Lock className="h-4 w-4 mx-3 text-gray-500" />
                          <Input type="password" placeholder={t('resetPassword.confirmPassword')} {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setResetPasswordOpen(false)}>
                    {t('forgotPassword.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? t('resetPassword.resetting') : t('resetPassword.button')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Login;
