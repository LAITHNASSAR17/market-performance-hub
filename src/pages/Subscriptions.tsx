
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
          <h1 className="text-3xl font-bold mb-2">Track Mind - Subscription Plans</h1>
          <p className="text-gray-500 mb-10">Choose the plan that best fits your trading journey</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className={`border-2 ${currentTier === 'free' ? 'border-blue-500' : 'border-transparent'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Starter</CardTitle>
                  {currentTier === 'free' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardDescription>For beginner traders</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  $0<span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Max 10 trades per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>1 trading account only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic trade list view</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>1 AI analysis per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic notebook only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">No reports or analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">No image uploads</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={currentTier === 'free' ? "outline" : "default"}
                  className="w-full"
                  disabled={currentTier === 'free'}
                >
                  {currentTier === 'free' ? 'Current Plan' : 'Start Free'}
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan (Previously Pro) */}
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
                <CardDescription>For active traders</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  $14.99<span className="text-sm font-normal text-gray-500">/month</span>
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
                    <span>1 image per trade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Access to Reports & Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Notes & Tags feature</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Export data (CSV/PDF)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Calendar & Chart views</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">No Playbooks access</span>
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

            {/* Enterprise Plan (Previously Elite) */}
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
                <CardDescription>For professional traders</CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  $24.99<span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Everything in Premium, plus:</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Up to 3 images per trade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Trade Rating system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Playbooks creation & linking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Emotion & Strategy tagging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Advanced AI insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
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
            <p className="text-gray-500 mb-4">Contact us for a customized trading platform experience</p>
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
