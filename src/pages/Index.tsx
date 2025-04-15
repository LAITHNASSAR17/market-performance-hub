
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="h-screen flex items-center justify-center">جاري التحميل...</div>;
  }
  
  // Redirect to dashboard if authenticated, otherwise to login
  if (isAuthenticated) {
    console.log("Index page: User is authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log("Index page: User is not authenticated, redirecting to login");
  return <Navigate to="/login" replace />;
};

export default Index;
