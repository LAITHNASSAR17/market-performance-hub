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
import { supabase } from '@/lib/supabase';

const Register: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const { handleRegister, isAuthenticated, isLoading } = useAuth(); // Use handleRegister and isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword || !country) {
      setError(t('register.error.fillAll'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('register.error.passwordMismatch'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('register.error.passwordLength'));
      return;
    }
    
    try {
      console.log('Registering user with email:', email, 'and country:', country);
      
      // Pass correct parameters to handleRegister
      await handleRegister({ name, email, password, country });
      
      toast({
        title: t('register.success.title'),
        description: t('register.success.checkEmail'),
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('register.error.failed'));
      toast({
        title: t('register.error.title'),
        description: t('register.error.description'),
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
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('register.title')}</CardTitle>
            <CardDescription className="text-center">
              {t('register.description')}
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
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('register.fullName')}</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <User className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('register.fullName')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">{t('register.email')}</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Mail className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('register.email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="country">{t('register.country')}</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-gray-500" />
                        <SelectValue placeholder={t('register.selectCountry')} />
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

                <div className="grid gap-2">
                  <Label htmlFor="password">{t('register.password')}</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Lock className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('register.password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Lock className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t('register.confirmPassword')}
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
                  disabled={isLoading}
                >
                  {isLoading ? t('register.registering') : t('register.createAccount')}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              {t('register.haveAccount')}{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                {t('register.login')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
