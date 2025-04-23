
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Mail, LockKeyhole, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mock verification message if coming from verification page
  React.useEffect(() => {
    if (location.state?.verified) {
      setSuccessMessage(location.state.message || "Your email has been verified successfully.");
      setEmail(location.state.email || "");
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Login page: Starting login for', email);
      
      // Mock successful login after delay
      setTimeout(() => {
        // For demo purposes, let's consider these credentials as valid
        if (email === 'demo@example.com' && password === 'password123') {
          // Store auth status in localStorage for demo
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify({ 
            name: 'Demo User', 
            email: email, 
            role: 'user'
          }));
          
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          
          navigate('/dashboard');
        } else {
          throw new Error('Invalid credentials');
        }
        setLoading(false);
      }, 1500);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Login failed. Please check your email and password.";
      
      if (error.message === 'Invalid credentials') {
        errorMessage = "Invalid email or password";
      }
      
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-500 p-3 rounded-full">
            <LineChart className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <Mail className="h-4 w-4 mx-3 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-blue-600" 
                    onClick={handleForgotPassword}
                    type="button"
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <LockKeyhole className="h-4 w-4 mx-3 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
