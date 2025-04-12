
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { UserCircle, Mail, Key, Shield, Globe, Bell, Moon, Sun, Brush } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import UpdateUserProfileDialog from '@/components/settings/UpdateUserProfileDialog';

const Settings: React.FC = () => {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    tradeAlerts: true,
    systemUpdates: true,
    marketNews: false,
    emailDigest: true
  });
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleUpdateProfile = async (userData: any) => {
    try {
      if (userData.newPassword) {
        // If updating password
        await changePassword(userData.currentPassword, userData.newPassword);
      } else {
        // If updating profile info
        await updateUserProfile(userData);
      }
      
      setShowProfileDialog(false);
      
      toast({
        title: "Settings Updated",
        description: "Your settings have been updated successfully."
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleNotification = (key: string) => {
    setNotifications(prev => ({ 
      ...prev, 
      [key]: !prev[key as keyof typeof notifications] 
    }));
    
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved."
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
        </header>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Manage your personal information and email settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500" />
                <div>
                  <Label>Username</Label>
                  <p className="text-sm text-gray-500">{user?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <Label>Email Address</Label>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <Label>Account Type</Label>
                  <p className="text-sm text-gray-500">{user?.isAdmin ? 'Administrator' : 'Standard User'}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t py-4">
            <Button onClick={() => setShowProfileDialog(true)}>Edit Profile</Button>
          </CardFooter>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brush className="h-5 w-5 text-primary" />
              <CardTitle>Display Settings</CardTitle>
            </div>
            <CardDescription>
              Customize the appearance of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-gray-500" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>Trade Alerts</Label>
                <p className="text-sm text-gray-500">Receive notifications about your trades</p>
              </div>
              <Switch 
                checked={notifications.tradeAlerts} 
                onCheckedChange={() => handleToggleNotification('tradeAlerts')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>System Updates</Label>
                <p className="text-sm text-gray-500">Important updates and announcements</p>
              </div>
              <Switch 
                checked={notifications.systemUpdates} 
                onCheckedChange={() => handleToggleNotification('systemUpdates')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>Market News</Label>
                <p className="text-sm text-gray-500">Latest news about markets and assets</p>
              </div>
              <Switch 
                checked={notifications.marketNews} 
                onCheckedChange={() => handleToggleNotification('marketNews')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>Email Digest</Label>
                <p className="text-sm text-gray-500">Weekly summary of your trading activity</p>
              </div>
              <Switch 
                checked={notifications.emailDigest} 
                onCheckedChange={() => handleToggleNotification('emailDigest')} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Regional Settings</CardTitle>
            </div>
            <CardDescription>
              Set your language and timezone preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>Language</Label>
                <p className="text-sm text-gray-500">English (US)</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>Timezone</Label>
                <p className="text-sm text-gray-500">UTC+00:00</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </CardContent>
        </Card>

        {showProfileDialog && (
          <UpdateUserProfileDialog 
            open={showProfileDialog}
            onClose={() => setShowProfileDialog(false)}
            onUpdateProfile={handleUpdateProfile}
            currentUsername={user?.name || ''}
            currentEmail={user?.email || ''}
          />
        )}
      </div>
    </Layout>
  );
};

export default Settings;
