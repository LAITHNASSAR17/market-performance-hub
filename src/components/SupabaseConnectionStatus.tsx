
import React, { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

const SupabaseConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
    const connected = await checkSupabaseConnection();
    setIsConnected(connected);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (isConnected === null || isChecking) {
    return (
      <div className="py-2 px-3 bg-muted rounded-md text-sm flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>فحص الاتصال بقاعدة البيانات...</span>
      </div>
    );
  }

  if (isConnected) {
    return null; // Don't show anything if connected successfully
  }

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
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseConnectionStatus;
