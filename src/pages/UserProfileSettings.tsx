import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User, Key, Lock, LogOut, Save, Globe, Clock, Trash2, CreditCard, 
  ShieldAlert, UserCog, Upload, Check, AlertCircle, Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { countries } from '@/utils/countries';

const UserProfileSettings: React.FC = () => {
  const { user, updateProfile, logout, updateSubscriptionTier, changePassword } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.name?.split(' ')[0]?.toLowerCase() || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState<string>('/placeholder.svg');
  const [country, setCountry] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUsername(user.name?.split(' ')[0]?.toLowerCase() || '');
      
      const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data && !error) {
            setCountry(data.country || '');
            if (data.avatar_url) {
              setProfilePicture(data.avatar_url);
            }
          }
        }
      };
      
      fetchProfile();
    }
  }, [user]);
  
  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Not authenticated");
      }
      
      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const avatarUrl = data.publicUrl;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId, 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });
        
      if (updateError) {
        throw updateError;
      }
      
      setProfilePicture(avatarUrl);
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully"
      });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image under 2MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      uploadAvatar(file);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
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
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        console.log('Updating profile with country:', country);
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({ 
            id: session.user.id, 
            country: country,
            updated_at: new Date().toISOString()
          });
          
        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
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
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation Failed",
        description: "Please type DELETE to confirm account deletion",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
        variant: "destructive"
      });
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "There was an error deleting your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteConfirmText('');
    }
  };
  
  const handleLogoutAllDevices = async () => {
    try {
      toast({
        title: "Success",
        description: "You have been logged out from all devices",
      });
      logout();
    } catch (error) {
      console.error('Error logging out from all devices:', error);
      toast({
        title: "Error",
        description: "There was an error logging out from all devices. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpgradePlan = () => {
    window.location.href = '/payment';
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          Account Settings
        </h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Profile Information
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Update your account information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid gap-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <img 
                            src={profilePicture} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          className="absolute -bottom-2 -right-2 rounded-full p-1"
                          onClick={triggerFileSelect}
                          disabled={uploading}
                        >
                          <Upload className="h-4 w-4" />
                          <span className="sr-only">Upload</span>
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium dark:text-white mb-1">
                          Profile Picture
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Upload a 1:1 aspect ratio image with high resolution.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={triggerFileSelect}
                            disabled={uploading}
                          >
                            {uploading ? 'Uploading...' : 'Upload Image'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setProfilePicture('/placeholder.svg')}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="name">
                        Full Name
                      </Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="username">
                        Username
                      </Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Enter your username"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="email">
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="country">
                        Country
                      </Label>
                      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={countryOpen}
                            className="w-full justify-between"
                          >
                            {country
                              ? countries.find((c) => c.value === country)?.label
                              : 'Select country'}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search country..." 
                              className="h-9"
                            />
                            <CommandEmpty>
                              No results found
                            </CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {countries.map((c) => (
                                <CommandItem
                                  key={c.value}
                                  value={c.value}
                                  onSelect={(currentValue) => {
                                    setCountry(currentValue);
                                    setCountryOpen(false);
                                  }}
                                  className="flex items-center"
                                >
                                  {c.label}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      country === c.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        {isUpdating ? 'Updating...' : (
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Change Password
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Update your password to maintain account security.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange}>
                  {passwordError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 dark:bg-red-900/30 dark:text-red-400">
                      {passwordError}
                    </div>
                  )}
                  
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="currentPassword">
                        Current Password
                      </Label>
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
                      <Label htmlFor="newPassword">
                        New Password
                      </Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
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
                        {isChangingPassword ? 'Updating...' : (
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
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Subscription Plan
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage your subscription and upgrade your plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 dark:text-white">
                      Current Plan: Free
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You are currently on the free plan. Upgrade to unlock more features.
                    </p>
                    <Button onClick={handleUpgradePlan}>
                      Upgrade Plan
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <h3 className="font-semibold text-base dark:text-white">
                      Plan Comparison
                    </h3>
                    <div className="grid gap-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Free Plan</span>
                        <span className="text-gray-500">$0 / month</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Pro Plan</span>
                        <span className="text-gray-500">$9.99 / month</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Enterprise Plan</span>
                        <span className="text-gray-500">Contact us</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Active Sessions
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage devices connected to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-medium dark:text-white">
                        This Device
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last login: Now
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={logout}
                      className="text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleLogoutAllDevices}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout from All Devices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Delete Account
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  This action is permanent and cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600">
                        Delete Account Permanently
                      </DialogTitle>
                      <DialogDescription>
                        This action is permanent and cannot be undone. All your data will be deleted.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          This will permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="delete-confirm">
                          Type "DELETE" to confirm
                        </Label>
                        <Input 
                          id="delete-confirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE'}
                      >
                        Yes, Delete My Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfileSettings;
