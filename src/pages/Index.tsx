
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Check for password reset tokens in multiple formats
  const resetToken = searchParams.get('reset_token') || searchParams.get('type') === 'recovery';
  const hashToken = location.hash.includes('access_token=') || location.hash.includes('type=recovery');
  
  // If it's a password reset, redirect to reset-password page with all parameters intact
  if (resetToken || hashToken) {
    console.log("Password reset detected, redirecting to reset-password page");
    return <Navigate to={`/reset-password${location.search}${location.hash}`} replace />;
  }
  
  // Normal auth flow
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Navigate to="/login" />;
};

export default Index;
