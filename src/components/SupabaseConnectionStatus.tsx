
import React, { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

const SupabaseConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [checkAttempts, setCheckAttempts] = useState(0);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkSupabaseConnection();
      console.log('Connection check result:', connected);
      setIsConnected(connected);
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
      setCheckAttempts(prev => prev + 1);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection again after 2 seconds if first attempt failed
    const timer = setTimeout(() => {
      if (isConnected === false && checkAttempts < 2) {
        console.log('Retrying connection check automatically');
        checkConnection();
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isConnected, checkAttempts]);

  if (isConnected === null || isChecking) {
    return (
      <div className="py-2 px-3 bg-muted rounded-md text-sm flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>فحص الاتصال بقاعدة البيانات...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>مشكلة اتصال</AlertTitle>
        <AlertDescription>
          تعذر الاتصال بقاعدة البيانات. لن تتمكن من إنشاء حساب جديد أو تسجيل الدخول.
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkConnection}
              disabled={isChecking}
              className="flex items-center gap-2"
            >
              {isChecking && <RefreshCw className="h-3 w-3 animate-spin" />}
              إعادة المحاولة
            </Button>
          </div>
          <div className="mt-2 text-sm">
            يمكنك استخدام الحساب التجريبي: test@example.com / كلمة المرور: 123456
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SupabaseConnectionStatus;
