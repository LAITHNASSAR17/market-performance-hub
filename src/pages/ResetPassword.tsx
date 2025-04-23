
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, LockKeyhole, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResetPassword: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Parse email from URL query parameters
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      console.log('ResetPassword: Email from URL:', emailParam);
    } else {
      setError('Email not provided in the link');
      console.error('ResetPassword: No email provided in URL');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('ResetPassword: Resetting password for email:', email);
      
      // Mock successful password reset
      setTimeout(() => {
        setSuccess(true);
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully. You can now login with your new password.",
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('ResetPassword: Error:', error);
      setError('Failed to change password. Please try again.');
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {success 
                ? "Password changed successfully. Redirecting to login page..."
                : "Please enter your new password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!success ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="password">New Password</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <LockKeyhole className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <LockKeyhole className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </Button>
              </form>
            ) : (
              <div className="text-center p-4">
                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                  Password changed successfully! Redirecting to login page...
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Want to go back to{' '}
              <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate('/login')}>
                Login
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
