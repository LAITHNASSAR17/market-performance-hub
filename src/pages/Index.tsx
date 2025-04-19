
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Use isLoading instead of loading
  const [redirect, setRedirect] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log("Index page: User is authenticated, redirecting to dashboard");
        setRedirect('/dashboard');
      } else {
        console.log("Index page: User is not authenticated, redirecting to login");
        setRedirect('/login');
      }
    }
  }, [isAuthenticated, isLoading]);
  
  // Show loading state while checking authentication
  if (isLoading || !redirect) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect to appropriate page
  return <Navigate to={redirect} replace />;
};

export default Index;
