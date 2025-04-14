
import React, { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
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
import { supabase } from '@/lib/supabase';

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading, forgotPassword } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const forgotPasswordSchema = z.object({
    email: z.string().email({ message: t('login.error.invalidEmail') }),
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    // Check for email verification status
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      toast({
        title: t('login.emailVerified.title'),
        description: t('login.emailVerified.description'),
      });
    }
  }, [searchParams, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError(t('login.error.emptyFields'));
      return;
    }
    
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('login.error.credentials'));
    }
  };

  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await forgotPassword(values.email);
      setForgotPasswordOpen(false);
      toast({
        title: t('forgotPassword.emailSent'),
        description: t('forgotPassword.checkEmail'),
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: t('forgotPassword.error'),
        description: error.message || t('forgotPassword.errorGeneric'),
        variant: "destructive",
      });
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
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
            {searchParams.get('verified') === 'true' && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('login.emailVerified.description')}
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
    </div>
  );
};

export default Login;
