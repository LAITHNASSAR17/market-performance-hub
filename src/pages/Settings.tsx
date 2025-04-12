
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
import { UserCircle, Mail, Shield, Globe, Bell, Moon, Sun, Brush } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import UpdateUserProfileDialog from '@/components/settings/UpdateUserProfileDialog';
import LanguageToggle from '@/components/LanguageToggle';

const Settings: React.FC = () => {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
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
        await updateUserProfile({
          name: userData.username,
          email: userData.email
        });
      }
      
      setShowProfileDialog(false);
      
      toast({
        title: t('settings.updated') || "Settings Updated",
        description: t('settings.updatedSuccess') || "Your settings have been updated successfully."
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: t('settings.updateFailed') || "Update Failed",
        description: t('settings.updateFailedDesc') || "Failed to update your settings. Please try again.",
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
      title: t('settings.notificationsUpdated') || "Notification Settings Updated",
      description: t('settings.notificationsPreferencesSaved') || "Your notification preferences have been saved."
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold">{t('settings.accountSettings') || 'Account Settings'}</h1>
          <p className="text-gray-500 mt-1">{t('settings.manageAccount') || 'Manage your account settings and preferences'}</p>
        </header>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              <CardTitle>{t('settings.profileInformation') || 'Profile Information'}</CardTitle>
            </div>
            <CardDescription>
              {t('settings.managePersonalInfo') || 'Manage your personal information and email settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500" />
                <div>
                  <Label>{t('settings.username') || 'Username'}</Label>
                  <p className="text-sm text-gray-500">{user?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <Label>{t('settings.emailAddress') || 'Email Address'}</Label>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <Label>{t('settings.accountType') || 'Account Type'}</Label>
                  <p className="text-sm text-gray-500">{user?.isAdmin ? (t('settings.administrator') || 'Administrator') : (t('settings.standardUser') || 'Standard User')}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t py-4">
            <Button onClick={() => setShowProfileDialog(true)}>
              {t('settings.editProfile') || 'Edit Profile'}
            </Button>
          </CardFooter>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brush className="h-5 w-5 text-primary" />
              <CardTitle>{t('settings.displaySettings') || 'Display Settings'}</CardTitle>
            </div>
            <CardDescription>
              {t('settings.customizeAppearance') || 'Customize the appearance of your dashboard'}
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
                  <Label>{t('settings.darkMode') || 'Dark Mode'}</Label>
                  <p className="text-sm text-gray-500">
                    {t('settings.switchTheme') || 'Switch between light and dark theme'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme} 
              />
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-500" />
                <div>
                  <Label>{t('settings.language') || 'Language'}</Label>
                  <p className="text-sm text-gray-500">
                    {t('settings.switchLanguage') || 'Switch between Arabic and English'}
                  </p>
                </div>
              </div>
              <LanguageToggle variant="switch" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>{t('settings.notifications') || 'Notifications'}</CardTitle>
            </div>
            <CardDescription>
              {t('settings.manageNotifications') || 'Manage how you receive notifications and alerts'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>{t('settings.tradeAlerts') || 'Trade Alerts'}</Label>
                <p className="text-sm text-gray-500">
                  {t('settings.receiveTradeNotifications') || 'Receive notifications about your trades'}
                </p>
              </div>
              <Switch 
                checked={notifications.tradeAlerts} 
                onCheckedChange={() => handleToggleNotification('tradeAlerts')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>{t('settings.systemUpdates') || 'System Updates'}</Label>
                <p className="text-sm text-gray-500">
                  {t('settings.importantUpdates') || 'Important updates and announcements'}
                </p>
              </div>
              <Switch 
                checked={notifications.systemUpdates} 
                onCheckedChange={() => handleToggleNotification('systemUpdates')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>{t('settings.marketNews') || 'Market News'}</Label>
                <p className="text-sm text-gray-500">
                  {t('settings.latestNews') || 'Latest news about markets and assets'}
                </p>
              </div>
              <Switch 
                checked={notifications.marketNews} 
                onCheckedChange={() => handleToggleNotification('marketNews')} 
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <Label>{t('settings.emailDigest') || 'Email Digest'}</Label>
                <p className="text-sm text-gray-500">
                  {t('settings.weeklySummary') || 'Weekly summary of your trading activity'}
                </p>
              </div>
              <Switch 
                checked={notifications.emailDigest} 
                onCheckedChange={() => handleToggleNotification('emailDigest')} 
              />
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
