
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, UserPlus, Settings, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const { createUser } = useAuth();
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'TradeTracker',
    siteDescription: 'Track your trading performance and analyze your results',
    supportEmail: 'support@tradetracker.com',
    privacyPolicy: '',
    termsOfService: ''
  });
  
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleSiteSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Site settings have been updated successfully"
    });
  };
  
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new admin user
    createUser({
      name: newAdmin.name,
      email: newAdmin.email,
      password: newAdmin.password,
      isAdmin: true
    });
    
    toast({
      title: "Admin Added",
      description: `${newAdmin.name} has been added as an admin`
    });
    
    // Reset form
    setNewAdmin({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Configure and manage system-wide settings.
        </p>
      </header>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="admins">
            <UserPlus className="h-4 w-4 mr-2" />
            Manage Admins
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Globe className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure general settings for your trading platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={siteSettings.siteName}
                    onChange={handleSiteSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    name="siteDescription"
                    value={siteSettings.siteDescription}
                    onChange={handleSiteSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    name="supportEmail"
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={handleSiteSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="privacyPolicy">Privacy Policy URL</Label>
                  <Input
                    id="privacyPolicy"
                    name="privacyPolicy"
                    value={siteSettings.privacyPolicy}
                    onChange={handleSiteSettingsChange}
                    placeholder="https://example.com/privacy"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="termsOfService">Terms of Service URL</Label>
                  <Input
                    id="termsOfService"
                    name="termsOfService"
                    value={siteSettings.termsOfService}
                    onChange={handleSiteSettingsChange}
                    placeholder="https://example.com/terms"
                  />
                </div>
                
                <Button type="submit">Save Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Manage Administrators</CardTitle>
              <CardDescription>
                Add new admin users to help manage the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name</Label>
                  <Input
                    id="adminName"
                    name="name"
                    value={newAdmin.name}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email Address</Label>
                  <Input
                    id="adminEmail"
                    name="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    name="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                  <Input
                    id="adminConfirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={newAdmin.confirmPassword}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                
                <Button type="submit">Add Administrator</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium">Default Theme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Set the default theme for all users.
                  </p>
                </div>
                <ThemeToggle variant="switch" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Custom Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        value="#9b87f5"
                        className="w-12 h-8 p-0"
                      />
                      <Input
                        value="#9b87f5"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="color"
                        value="#6E59A5"
                        className="w-12 h-8 p-0"
                      />
                      <Input
                        value="#6E59A5"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <Button type="button">Save Appearance Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Manage database operations and backups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Database Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Connected</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Last backup: 2025-04-12 13:45:12</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">Backup Database</Button>
                <Button variant="outline" className="flex-1">Restore Backup</Button>
                <Button variant="destructive" className="flex-1">Reset Database</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
