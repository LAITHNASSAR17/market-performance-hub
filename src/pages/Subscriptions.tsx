
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePayment = () => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please select a subscription plan first",
        variant: "destructive",
      });
      return;
    }

    navigate('/payment', { state: { plan: selectedPlan } });
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      period: 'month',
      description: 'Perfect for beginners',
      features: [
        '10 trades per day',
        'Basic analytics',
        'Trade journal',
        'Email support'
      ],
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$19.99',
      period: 'month',
      description: 'For serious traders',
      features: [
        'Unlimited trades',
        'Advanced analytics',
        'Trade journal with insights',
        'Priority support',
        'Trade patterns recognition'
      ],
      recommended: true,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$39.99',
      period: 'month',
      description: 'For trading teams',
      features: [
        'Everything in Professional',
        'Multiple user accounts',
        'Team analytics',
        'API access',
        'Dedicated support manager',
        'Custom reports'
      ],
      color: 'green'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Choose Your Subscription Plan</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Elevate your trading experience with our premium plans. Select the option that best fits your trading style and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isRecommended = plan.recommended;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isSelected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'} overflow-hidden`}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 text-xs font-medium">
                    Recommended
                  </div>
                )}
                <CardHeader className={`bg-gradient-to-r ${
                  plan.color === 'blue' ? 'from-blue-500 to-blue-600' : 
                  plan.color === 'purple' ? 'from-purple-500 to-indigo-600' : 
                  'from-green-500 to-emerald-600'
                } text-white`}>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {plan.color === 'blue' ? <Shield className="h-5 w-5" /> : 
                     plan.color === 'purple' ? <Zap className="h-5 w-5" /> : 
                     <Shield className="h-5 w-5" />}
                    {plan.name}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm opacity-80">/{plan.period}</span>
                  </div>
                  <CardDescription className="text-white opacity-90 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={isSelected ? "default" : "outline"} 
                    className="w-full"
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handlePayment}
            disabled={!selectedPlan}
            className="px-8"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Proceed to Payment
          </Button>
          
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            All plans include a 7-day free trial. No credit card required until trial ends.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
