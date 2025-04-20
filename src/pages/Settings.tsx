
import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { siteSettings } = useSettings();
  const navigate = useNavigate();

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-medium">User Information</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.name || 'Not provided'} • {user?.email}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/profile')}
                    >
                      Edit Profile
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-medium">Subscription Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Current plan: {user?.subscription_tier || 'Free'}
                      </p>
                    </div>
                    <Button variant="outline">
                      Manage Subscription
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-medium">Password & Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Update your password and security settings
                      </p>
                    </div>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {user?.isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Options</CardTitle>
                  <CardDescription>Access administrative features</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/admin')}>
                    Go to Admin Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Sign out or manage your account status</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => logout()}
                >
                  Sign Out
                </Button>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Theme preference settings will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced options</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Advanced configuration options will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
