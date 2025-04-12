
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Trade Tracker Pro",
    siteDescription: "Track your trades and improve your trading performance",
    enableSignups: true,
    requireEmailVerification: true,
    maxUsersPerPlan: 1000
  });
  
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: true
  });

  const handleSiteSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setSiteSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveSettings = () => {
    // Here you would typically save the settings to a database
    toast({
      title: "Settings Saved",
      description: "Your site settings have been updated.",
    });
  };
  
  const handleAddAdmin = () => {
    // Here you would typically create a new admin user
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    // Implementation for adding admin user would go here
    toast({
      title: "Admin Added",
      description: `New admin ${newAdminData.name} has been created.`,
    });
    
    // Reset form
    setNewAdminData({
      name: '',
      email: '',
      password: '',
      isAdmin: true
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Configure global settings for the application</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure the global settings for your trading platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  name="siteName" 
                  value={siteSettings.siteName} 
                  onChange={handleSiteSettingsChange} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea 
                  id="siteDescription" 
                  name="siteDescription" 
                  value={siteSettings.siteDescription} 
                  onChange={handleSiteSettingsChange} 
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableSignups">Enable New Sign Ups</Label>
                  <p className="text-sm text-gray-500">Allow new users to register on the platform.</p>
                </div>
                <Switch 
                  id="enableSignups" 
                  checked={siteSettings.enableSignups}
                  onCheckedChange={(checked) => handleSwitchChange('enableSignups', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-gray-500">New users must verify their email before accessing the platform.</p>
                </div>
                <Switch 
                  id="requireEmailVerification" 
                  checked={siteSettings.requireEmailVerification}
                  onCheckedChange={(checked) => handleSwitchChange('requireEmailVerification', checked)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxUsersPerPlan">Maximum Users Per Plan</Label>
                <Input 
                  id="maxUsersPerPlan" 
                  name="maxUsersPerPlan" 
                  type="number" 
                  value={siteSettings.maxUsersPerPlan.toString()}
                  onChange={handleSiteSettingsChange} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Add Admin User</CardTitle>
              <CardDescription>Create a new administrator account with full system access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="adminName">Name</Label>
                <Input 
                  id="adminName" 
                  name="name" 
                  value={newAdminData.name} 
                  onChange={handleNewAdminChange} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input 
                  id="adminEmail" 
                  name="email"
                  type="email" 
                  value={newAdminData.email} 
                  onChange={handleNewAdminChange} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input 
                  id="adminPassword" 
                  name="password"
                  type="password" 
                  value={newAdminData.password} 
                  onChange={handleNewAdminChange} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddAdmin}>Add Admin</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options for your platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Complexity</Label>
                  <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-gray-500">Automatically log out inactive users</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Security Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Database Backups</CardTitle>
              <CardDescription>Manage system backups and restoration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Last Backup: <span className="text-gray-500">April 10, 2025, 03:45 AM</span></h3>
                <p className="text-sm text-gray-500 mt-1">Automatic system backup completed successfully.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">Create Manual Backup</Button>
                <Button variant="outline" className="w-full">Restore from Backup</Button>
              </div>
              <div className="space-y-2">
                <Label>Backup Schedule</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">Daily</Button>
                  <Button variant="outline" className="w-full">Weekly</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Backup Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
