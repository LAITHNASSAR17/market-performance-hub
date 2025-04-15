
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const [redirect, setRedirect] = useState<string | null>(null);
  
  useEffect(() => {
    // Check localStorage for remembered session
    const rememberedPath = localStorage.getItem('last_path');
    const isRemembered = localStorage.getItem(AUTH_STATUS_KEY) === 'true';
    
    if (!loading) {
      if (isAuthenticated) {
        console.log("Index page: User is authenticated, redirecting to dashboard");
        // If user is authenticated, go to dashboard or last remembered path
        const redirectPath = rememberedPath && rememberedPath !== '/' && rememberedPath !== '/login' 
          ? rememberedPath 
          : '/dashboard';
        setRedirect(redirectPath);
      } else {
        console.log("Index page: User is not authenticated, redirecting to login");
        setRedirect('/login');
      }
    }
  }, [isAuthenticated, loading]);
  
  // Show loading state while checking authentication
  if (loading || !redirect) {
    return <div className="h-screen flex items-center justify-center">جاري التحميل...</div>;
  }
  
  // Redirect to appropriate page
  return <Navigate to={redirect} replace />;
};

// Same constant as in AuthContext for consistency
const AUTH_STATUS_KEY = 'trackmind_auth_status';

export default Index;
