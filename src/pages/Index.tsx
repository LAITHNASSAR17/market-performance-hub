
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Check for password reset tokens in multiple formats
  const resetToken = searchParams.get('reset_token') || searchParams.get('type') === 'recovery';
  const hashToken = location.hash.includes('access_token=') || location.hash.includes('type=recovery');
  
  // Check for email verification parameters
  const isEmailVerification = 
    searchParams.get('type') === 'signup' || 
    location.hash.includes('type=signup') ||
    searchParams.get('verified') === 'true';
  
  console.log("Index page check:", {
    resetToken,
    hashToken,
    isEmailVerification,
    isAuthenticated,
    searchParams: Object.fromEntries(searchParams.entries()),
    hash: location.hash
  });
  
  // If it's a password reset, redirect to reset-password page with all parameters intact
  if (resetToken || hashToken) {
    console.log("Password reset detected, redirecting to reset-password page");
    return <Navigate to={`/reset-password${location.search}${location.hash}`} replace />;
  }
  
  // If it's an email verification, redirect to login with verified flag
  if (isEmailVerification) {
    console.log("Email verification detected, redirecting to login page with verified flag");
    return <Navigate to="/login?verified=true" replace />;
  }
  
  // Normal auth flow
  if (isAuthenticated) {
    console.log("User is authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }
  
  console.log("User is not authenticated, redirecting to login");
  return <Navigate to="/login" />;
};

export default Index;
