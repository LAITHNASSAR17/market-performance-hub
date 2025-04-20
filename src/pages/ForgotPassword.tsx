import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPassword: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('ForgotPassword: Sending password reset email to:', email);
      await forgotPassword(email);
      console.log('ForgotPassword: Email sent successfully');
      
      setEmailSent(true);
      toast({
        title: "Password reset link has been sent",
        description: "Please check your email for the password reset link",
      });
    } catch (error: any) {
      console.error('ForgotPassword: Error in password reset:', error);
      if (error.message === "User not found") {
        setError('Email is not registered in the system');
        toast({
          title: "Email not registered",
          description: "We couldn't find a user account associated with this email",
          variant: "destructive",
        });
      } else {
        setError(error.message || 'Failed to send password reset email. Please try again.');
        toast({
          title: "Error",
          description: "Failed to send password reset email. Please try again.",
          variant: "destructive",
        });
      }
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
              {emailSent 
                ? "Password reset link has been sent. Please check your email."
                : "Enter your email and we'll send you a link to reset your password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!emailSent ? (
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-green-800">
                    Password reset link has been sent to <strong>{email}</strong>. 
                    Please check your email and follow the instructions.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => setEmailSent(false)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Send Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Remembered your password?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
