import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Key, Lock, Save, UserCircle, Mail, Globe, 
  Clock, Trash2, LogOut, BellRing, Calendar, MapPin, Shield
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const UserProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.name?.toLowerCase().replace(/\s/g, '') || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateProfile(name, email);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await updateProfile(user?.name || '', user?.email || '', currentPassword, newPassword);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully"
      });
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This feature is not yet implemented."
    });
  };

  const handleLogoutAllDevices = () => {
    toast({
      title: "Logout from All Devices",
      description: "This feature is not yet implemented."
    });
  };

  // Get current date as fallback for join date
  const joinDate = new Date().toLocaleDateString();

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <h1 className="text-3xl font-bold mb-6">User Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User Information
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Password & Security
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Update your personal information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid gap-6">
                    <div className="mx-auto mb-4">
                      <div className="relative w-24 h-24 mx-auto mb-2">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {user?.name ? (
                            <span className="text-3xl font-bold text-gray-500">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <UserCircle className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-1">
                          <span className="sr-only">Upload profile image</span>
                          <UserCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-center text-sm text-gray-500">Click to upload profile picture</p>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Your username"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Your email address"
                      />
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="grid gap-3">
                      <Label htmlFor="language">Preferred Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="country">Country</Label>
                        <Select defaultValue="us">
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                            <SelectItem value="sa">Saudi Arabia</SelectItem>
                            <SelectItem value="ae">United Arab Emirates</SelectItem>
                            <SelectItem value="jo">Jordan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-3">
                        <Label htmlFor="timezone">Time Zone</Label>
                        <Select defaultValue="gmt">
                          <SelectTrigger>
                            <SelectValue placeholder="Select time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gmt">GMT (London)</SelectItem>
                            <SelectItem value="est">EST (New York)</SelectItem>
                            <SelectItem value="pst">PST (Los Angeles)</SelectItem>
                            <SelectItem value="ast">AST (Riyadh, Dubai)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        {isUpdating ? "Updating..." : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to maintain account security.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange}>
                    {passwordError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                        {passwordError}
                      </div>
                    )}
                    
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid gap-3">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                        />
                      </div>
                      
                      <div className="grid gap-3">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isChangingPassword}
                          className="flex items-center gap-2"
                        >
                          {isChangingPassword ? "Updating..." : (
                            <>
                              <Lock className="h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>
                    Manage your account security and devices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <LogOut className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium">Logout from All Devices</h3>
                        <p className="text-sm text-gray-500">End all active sessions on other devices</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleLogoutAllDevices}>
                      Logout All
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg border-red-200">
                    <div className="flex items-center gap-3">
                      <Trash2 className="h-5 w-5 text-red-500" />
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Information</CardTitle>
                <CardDescription>
                  Manage your subscription plan and billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">Current Plan</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-blue-500 text-white">{user?.subscription_tier || 'Free'}</Badge>
                        {user?.subscription_tier !== 'free' && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button>Upgrade Plan</Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-500">Join Date</p>
                      <p className="font-medium">{joinDate}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-gray-500">Next Billing</p>
                      <p className="font-medium">
                        {user?.subscription_tier === 'free' ? 'N/A' : 'June 15, 2023'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Available Plans</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-white border-blue-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Free</CardTitle>
                        <CardDescription>Basic trading features</CardDescription>
                        <div className="mt-2 text-2xl font-bold">$0<span className="text-sm font-normal text-gray-500">/month</span></div>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2 pb-6">
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> Up to 10 trades per month
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> Basic analytics
                        </p>
                        <p className="flex items-center gap-2 text-gray-400">
                          <span>✕</span> Advanced features
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-purple-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Premium</CardTitle>
                        <CardDescription>Advanced trading tools</CardDescription>
                        <div className="mt-2 text-2xl font-bold">$19<span className="text-sm font-normal text-gray-500">/month</span></div>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2 pb-6">
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> Unlimited trades
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> Advanced analytics
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> Priority support
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-indigo-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Enterprise</CardTitle>
                        <CardDescription>Full-featured solution</CardDescription>
                        <div className="mt-2 text-2xl font-bold">$49<span className="text-sm font-normal text-gray-500">/month</span></div>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2 pb-6">
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> Everything in Premium
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> AI trade analysis
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500">✓</span> API integrations
                        </p>
                      </CardContent>
                    </Card>
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

export default UserProfileSettings;
