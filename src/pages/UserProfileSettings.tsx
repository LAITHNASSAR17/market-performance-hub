
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, User, Mail, Lock, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UserProfileSettings: React.FC = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load user data from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setName(userData.name || '');
      setEmail(userData.email || '');
    }
  }, []);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple validation
    if (!name || !email) {
      setError('Name and email are required');
      setLoading(false);
      return;
    }
    
    // Mock API call to update profile
    setTimeout(() => {
      // Update user in local storage for demo
      const updatedUser = { ...user, name, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
      setLoading(false);
    }, 1000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');
    
    // Simple validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    // Mock password validation (in real app would check against stored password)
    if (currentPassword !== 'password123') { // Demo password
      setPasswordError('Current password is incorrect');
      setLoading(false);
      return;
    }
    
    // Mock API call to update password
    setTimeout(() => {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully"
      });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <User className="h-4 w-4 mx-3 text-gray-500" />
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Mail className="h-4 w-4 mx-3 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                {passwordError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Lock className="h-4 w-4 mx-3 text-gray-500" />
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Enter your current password to verify</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-3">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Lock className="h-4 w-4 mx-3 text-gray-500" />
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Lock className="h-4 w-4 mx-3 text-gray-500" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating Password...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfileSettings;
