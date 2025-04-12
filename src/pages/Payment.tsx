
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { CreditCard, Lock, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    // Get the selected plan from location state
    if (location.state && location.state.plan) {
      setSelectedPlan(location.state.plan);
    } else {
      // If no plan is selected, redirect back to subscriptions
      toast({
        title: "No plan selected",
        description: "Please select a subscription plan first",
        variant: "destructive",
      });
      navigate('/subscriptions');
    }
  }, [location, navigate, toast]);

  // Get plan details based on selected plan ID
  const getPlanDetails = () => {
    const plans = {
      'basic': {
        name: 'Basic Plan',
        price: '$9.99',
        period: 'month'
      },
      'pro': {
        name: 'Professional Plan',
        price: '$19.99',
        period: 'month'
      },
      'enterprise': {
        name: 'Enterprise Plan',
        price: '$39.99',
        period: 'month'
      }
    };
    
    return selectedPlan ? plans[selectedPlan] : null;
  };

  const planDetails = getPlanDetails();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!cardNumber || !expiryDate || !cvv || !name) {
      toast({
        title: "Missing information",
        description: "Please fill out all card details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful",
        description: `Your subscription to the ${planDetails?.name} has been activated`,
      });
      
      // Navigate to success page
      navigate('/payment-success', { 
        state: { 
          plan: selectedPlan,
          planName: planDetails?.name
        } 
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <Layout>
      <div className="container mx-auto my-8 max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <CreditCard className="mr-2 h-6 w-6" />
              Secure Payment
            </CardTitle>
            <CardDescription>
              Enter your payment details to complete your subscription
            </CardDescription>
          </CardHeader>
          
          {planDetails && (
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Selected Plan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{planDetails.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{planDetails.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/{planDetails.period}</span>
                </div>
              </div>
              
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="Name as it appears on card"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <img src="https://placehold.co/60x40/png" alt="Card providers" className="h-5" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">Security Code</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </Button>
              </form>
            </CardContent>
          )}
          
          <CardFooter className="flex flex-col">
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                <span>30-day Guarantee</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Payment;
