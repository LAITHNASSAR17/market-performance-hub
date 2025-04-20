
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react';

const EmailVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setError('Verification token is missing.');
          setVerifying(false);
          return;
        }

        // Handle email verification based on Supabase version
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email_signup'
        });
        
        if (error) throw error;
        setVerified(true);
      } catch (err: any) {
        console.error('Error verifying email:', err);
        setError('Failed to verify your email. The token may be invalid or expired.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verifying
              ? 'Verifying your email address...'
              : verified
                ? 'Your email has been verified!'
                : 'Email verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          {verifying ? (
            <div className="h-16 w-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin" />
          ) : verified ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!verifying && (
            <>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <Button
                onClick={() => navigate(verified ? '/dashboard' : '/login')}
                className="w-full"
              >
                {verified ? 'Go to Dashboard' : 'Go to Login'}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailVerify;
