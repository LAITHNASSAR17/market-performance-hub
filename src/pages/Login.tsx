
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, AlertCircle, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();

  // Clear localStorage if URL has a clear param (for debugging purposes)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('clear')) {
      console.log('localStorage cleared due to ?clear parameter');
      localStorage.clear();
      window.location.href = window.location.pathname;
    }
  }, []);

  useEffect(() => {
    // Check if there's a test admin user
    const users = localStorage.getItem('users');
    if (users && JSON.parse(users).length > 0) {
      const adminUser = JSON.parse(users).find((u: any) => u.isAdmin);
      if (adminUser) {
        setShowCredentials(true);
      }
    }
  }, []);

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
      // Error is handled in the login function with toast
      setError(t('login.error.credentials'));
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-500 p-3 rounded-full">
            <LineChart className="h-8 w-8 text-white" />
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
                <Label htmlFor="password">{t('login.password')}</Label>
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
    </div>
  );
};

export default Login;
