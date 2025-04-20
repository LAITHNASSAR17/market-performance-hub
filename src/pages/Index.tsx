
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { createTestAccount } from '@/services/authService';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [connectionChecked, setConnectionChecked] = useState(false);
  
  // Check connection and create test account if needed
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we can connect to Supabase
        const connected = await checkSupabaseConnection();
        console.log('Initial Supabase connection check:', connected);
        
        // Create test account regardless of connection status
        // This helps ensure we have a fallback login in case of issues
        await createTestAccount();
        setConnectionChecked(true);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setConnectionChecked(true);
      }
    };
    
    initializeApp();
  }, []);
  
  // Determine redirect path after connection and auth are checked
  useEffect(() => {
    if (connectionChecked && !loading) {
      if (isAuthenticated) {
        console.log("Index page: User is authenticated, redirecting to dashboard");
        setRedirect('/dashboard');
      } else {
        console.log("Index page: User is not authenticated, redirecting to login");
        setRedirect('/login');
      }
    }
  }, [isAuthenticated, loading, connectionChecked]);
  
  // Show loading state while checking connection and authentication
  if (loading || !redirect || !connectionChecked) {
    return (
      <>
        <div className="h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
            <p className="mt-2 text-sm text-gray-500">التحقق من الاتصال بقاعدة البيانات</p>
            <RefreshCw className="h-4 w-4 mt-2 animate-spin text-blue-500" />
          </div>
        </div>
        <Toaster />
      </>
    );
  }
  
  // Redirect to appropriate page
  return (
    <>
      <Navigate to={redirect} replace />
      <Toaster />
    </>
  );
};

export default Index;
