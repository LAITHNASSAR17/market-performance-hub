
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const [redirect, setRedirect] = useState<string | null>(null);
  
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        console.log("Index page: User is authenticated, redirecting to dashboard");
        setRedirect('/dashboard');
      } else {
        console.log("Index page: User is not authenticated, redirecting to login");
        setRedirect('/login');
      }
    }
  }, [isAuthenticated, loading]);
  
  // Show loading state while checking authentication
  if (loading || !redirect) {
    return (
      <>
        <div className="h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
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
