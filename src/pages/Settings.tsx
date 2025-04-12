
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { Globe, Palette, User, CreditCard } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateUser, cancelSubscription } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData.password && userData.password !== userData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    // Only include password if it's been changed
    const updatedData = {
      name: userData.name,
      email: userData.email,
      ...(userData.password ? { password: userData.password } : {})
    };
    
    updateUser(updatedData);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully"
    });
  };
  
  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      cancelSubscription();
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">
          Settings
        </h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4 flex w-full sm:w-auto">
            <TabsTrigger value="profile" className="flex-1">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  User Profile
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage your personal information and account settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                    <Input 
                      id="password"
                      name="password"
                      type="password"
                      value={userData.password}
                      onChange={handleInputChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={userData.confirmPassword}
                      onChange={handleInputChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Appearance
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Customize the look of the application, including light/dark mode.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium dark:text-white">
                      Display Mode
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose between light and dark mode for the application interface.
                    </p>
                  </div>
                  <ThemeToggle variant="switch" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Subscription Management
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage your subscription plan and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium dark:text-white mb-2">
                      Current Plan
                    </h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                          {user?.subscription?.plan || "Free Plan"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.subscription?.status === 'active' 
                            ? `Next billing on ${user?.subscription?.nextBillingDate || 'N/A'}` 
                            : 'No active subscription'}
                        </p>
                      </div>
                      
                      {user?.subscription?.status === 'active' && (
                        <Button 
                          variant="destructive" 
                          onClick={handleCancelSubscription}
                        >
                          Cancel Plan
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium dark:text-white mb-2">
                      Upgrade Your Plan
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Unlock premium features to enhance your trading experience.
                    </p>
                    <Button asChild>
                      <a href="/subscriptions">View Plans</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
