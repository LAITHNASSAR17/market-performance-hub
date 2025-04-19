import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, Zap, ArrowRight } from 'lucide-react';
import PaymentButton from '@/components/PaymentButton';

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const currentTier = user?.subscription_tier || 'free';
  
  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-gray-500 mb-10">Choose the right plan for your trading journey</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className={`border-2 ${currentTier === 'free' ? 'border-blue-500' : 'border-transparent'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Free</CardTitle>
                  {currentTier === 'free' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardDescription>Basic trading features</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  $0<span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Up to 10 trades per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic trading journal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">Advanced notebook</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={currentTier === 'free' ? "outline" : "default"}
                  className="w-full"
                  disabled={currentTier === 'free'}
                >
                  {currentTier === 'free' ? 'Current Plan' : 'Start Now'}
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className={`border-2 ${currentTier === 'premium' ? 'border-purple-500' : 'border-transparent'} shadow-lg relative`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="h-4 w-4" />
                Most Popular
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-1">
                    <Crown className="h-5 w-5 text-purple-500" />
                    Premium
                  </CardTitle>
                  {currentTier === 'premium' && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardDescription>Advanced trading tools</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  $19<span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited trades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Advanced notebook</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Advanced trading insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <PaymentButton
                  tier="premium"
                  variant={currentTier === 'premium' ? "outline" : "default"}
                  className={`w-full ${currentTier !== 'premium' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  disabled={currentTier === 'premium'}
                  text={currentTier === 'premium' ? 'Current Plan' : 'Upgrade Now'}
                />
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className={`border-2 ${currentTier === 'enterprise' ? 'border-indigo-500' : 'border-transparent'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-1">
                    <Zap className="h-5 w-5 text-indigo-500" />
                    Enterprise
                  </CardTitle>
                  {currentTier === 'enterprise' && (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardDescription>Complete solution for professionals</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  $49<span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>All Premium features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>AI-powered trade analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Custom dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Custom reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>24/7 support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <PaymentButton
                  tier="enterprise"
                  variant={currentTier === 'enterprise' ? "outline" : "default"}
                  className={`w-full ${currentTier !== 'enterprise' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                  disabled={currentTier === 'enterprise'}
                  text={currentTier === 'enterprise' ? 'Current Plan' : 'Upgrade Now'}
                />
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Need a Custom Solution?</h3>
            <p className="text-gray-500 mb-4">Contact us for a custom trading platform experience</p>
            <Button variant="outline" className="gap-2">
              Contact Sales <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
