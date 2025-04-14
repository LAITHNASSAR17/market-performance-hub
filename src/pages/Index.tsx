import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Check if this is a password reset link
  const isPasswordReset = 
    searchParams.get('reset_token') || 
    location.hash.includes('access_token=') || 
    location.hash.includes('type=recovery');
  
  // If it's a password reset, redirect to reset-password page
  if (isPasswordReset) {
    // Pass along all URL parameters and hash
    const queryString = window.location.search;
    const hashString = window.location.hash;
    return <Navigate to={`/reset-password${queryString}${hashString}`} />;
  }
  
  // Otherwise do normal auth flow
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Navigate to="/login" />;
};

export default Index;
