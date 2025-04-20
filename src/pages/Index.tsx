
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect to appropriate page
  return <Navigate to={redirect} replace />;
};

export default Index;
