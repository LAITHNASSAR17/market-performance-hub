import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Check if this is a password reset link with any possible token format
  const isPasswordReset = 
    searchParams.get('reset_token') || 
    location.hash.includes('access_token=') || 
    location.hash.includes('type=recovery');
  
  // If it's a password reset, redirect to reset-password page with all parameters intact
  if (isPasswordReset) {
    console.log("Password reset detected, redirecting to reset-password page");
    const queryString = window.location.search;
    const hashString = window.location.hash;
    return <Navigate to={`/reset-password${queryString}${hashString}`} replace />;
  }
  
  // Otherwise do normal auth flow
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Navigate to="/login" />;
};

export default Index;
