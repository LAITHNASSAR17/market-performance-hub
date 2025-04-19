
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
                    <span>Up to 10 trades per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>1 trading account</span>
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
                    <span>Basic notebook</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">Advanced analytics</span>
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

            {/* Pro Plan */}
            <Card className={`border-2 ${currentTier === 'pro' ? 'border-purple-500' : 'border-transparent'} shadow-lg relative`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="h-4 w-4" />
                Most Popular
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-1">
                    <Crown className="h-5 w-5 text-purple-500" />
                    Pro
                  </CardTitle>
                  {currentTier === 'pro' && (
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
                    <span>Full analytics access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Reports & insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Export data (CSV/PDF)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">Advanced trading tools</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <PaymentButton
                  tier="pro"
                  variant={currentTier === 'pro' ? "outline" : "default"}
                  className={`w-full ${currentTier !== 'pro' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  disabled={currentTier === 'pro'}
                  text={currentTier === 'pro' ? 'Current Plan' : 'Upgrade Now'}
                />
              </CardFooter>
            </Card>

            {/* Elite Plan */}
            <Card className={`border-2 ${currentTier === 'elite' ? 'border-indigo-500' : 'border-transparent'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-1">
                    <Zap className="h-5 w-5 text-indigo-500" />
                    Elite
                  </CardTitle>
                  {currentTier === 'elite' && (
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
                    <span>Everything in Pro, plus:</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Up to 3 images per trade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Trade rating system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Playbooks & strategy analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <PaymentButton
                  tier="elite"
                  variant={currentTier === 'elite' ? "outline" : "default"}
                  className={`w-full ${currentTier !== 'elite' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                  disabled={currentTier === 'elite'}
                  text={currentTier === 'elite' ? 'Current Plan' : 'Upgrade Now'}
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
