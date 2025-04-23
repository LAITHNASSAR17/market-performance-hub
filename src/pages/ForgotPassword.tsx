
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Mock password reset request
      setTimeout(() => {
        // For demo purposes, we'll just display success message
        setSuccess(true);
        toast({
          title: "Reset link sent",
          description: "Password reset instructions have been sent to your email.",
        });
      }, 1500);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email. Please try again.');
      toast({
        title: "Password reset failed",
        description: "There was an error sending the password reset email.",
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
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Password reset instructions have been sent to your email.
                  Please check your inbox.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
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
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
