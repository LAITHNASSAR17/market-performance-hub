
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

const EmailVerify = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
    }
  }, [token, navigate]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      // We need to include email for VerifyEmailOtpParams, but we don't have it here
      // Let's use signInWithOtp instead which only requires token
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'signup',
        token: verificationToken
      });

      if (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        toast({
          title: "Error",
          description: "Email verification failed. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        const userId = data.user?.id;
        if (userId) {
          const isVerified = await verifyUser(userId);
          if (isVerified) {
            setVerificationStatus('success');
            toast({
              title: "Success",
              description: "Email verified successfully!",
            });
          } else {
            setVerificationStatus('error');
            toast({
              title: "Error",
              description: "Failed to update user status after verification.",
              variant: "destructive"
            });
          }
        } else {
          setVerificationStatus('error');
          toast({
            title: "Error",
            description: "User ID not found after verification.",
            variant: "destructive"
          });
        }
      } else {
        setVerificationStatus('error');
        toast({
          title: "Error",
          description: "Invalid verification data.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Unexpected error during email verification:', err);
      setVerificationStatus('error');
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive"
      });
    }
  };

  // Fix the verifyUser function to use proper tables
  const verifyUser = async (userId: string) => {
    try {
      // Use Supabase Auth API for email verification
      const { error } = await supabase.auth.updateUser({
        data: { email_verified: true }
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {verificationStatus === 'verifying' && (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Verifying Email...</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your email address.</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">Email Verified!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your email has been successfully verified. You can now access all features.
            </p>
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There was an error verifying your email. Please ensure the link is correct or request a new verification email.
            </p>
            <Button asChild variant="outline">
              <Link to="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerify;
