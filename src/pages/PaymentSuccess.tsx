
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Layout from '@/components/Layout';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const selectedTier = sessionStorage.getItem('selected_subscription_tier') || 'premium';

  useEffect(() => {
    // Clean up the stored tier
    return () => sessionStorage.removeItem('selected_subscription_tier');
  }, []);

  return (
    <Layout>
      <div className="container mx-auto my-12 max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Thank you. Your {selectedTier === 'premium' ? 'Premium' : 'Advanced'} subscription has been activated successfully.
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-500">
                Subscription details have been sent to your email.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
