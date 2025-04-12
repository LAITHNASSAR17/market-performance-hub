
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const planName = location.state?.planName || 'subscription plan';

  useEffect(() => {
    if (!location.state?.plan) {
      // If user didn't come from payment flow, redirect to dashboard
      navigate('/dashboard');
    }
  }, [location, navigate]);

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto my-12 max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto my-6 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Thank you for subscribing to our {planName}. Your account has been
              successfully upgraded.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-400">
                Your subscription is now active
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You now have access to all the premium features included in your plan.
              </p>
            </div>
            
            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subscription</p>
                  <p className="font-medium">{planName}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subscriber</p>
                  <p className="font-medium">{user?.name || user?.email || 'Account holder'}</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A receipt has been sent to your email address.
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handleContinueToDashboard} 
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
