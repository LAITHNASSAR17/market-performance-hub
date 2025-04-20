
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, Save, Globe, Bell, Shield, Database, 
  DollarSign, Trash2, FileWarning, AlertTriangle, Server, 
  FileText, LockKeyhole, Eye, EyeOff, Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';

const SystemSettingsExtended = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Retrieve site name from localStorage or use default
  const [siteName, setSiteName] = useState(() => {
    return localStorage.getItem('siteName') || 'TradeTracker';
  });
  
  const [dataRetention, setDataRetention] = useState(90);
  const [isPro, setIsPro] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Security settings
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [logFailedLogins, setLogFailedLogins] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  // Integration settings
  const [apiKeysVisible, setApiKeysVisible] = useState(false);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiEnabled, setApiEnabled] = useState(true);
  
  // Load settings from Supabase on component mount
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
          
        if (error) {
          console.error('Error loading site settings:', error);
          return;
        }
        
        if (data) {
          // Update site name in state and localStorage
          const siteNameValue = data.site_name || 'TradeTracker';
          setSiteName(siteNameValue);
          localStorage.setItem('siteName', siteNameValue);
          
          // Update document title
          document.title = siteNameValue;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    loadSiteSettings();
  }, []);
  
  const handleSaveSiteName = async () => {
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('site_settings')
        .update({ site_name: siteName })
        .eq('site_name', localStorage.getItem('siteName') || 'TradeTracker');
      
      if (error) {
        throw error;
      }
      
      // Update localStorage
      localStorage.setItem('siteName', siteName);
      
      // Update document title
      document.title = siteName;
      
      toast({
        title: "Saved",
        description: "Site name has been updated successfully"
      });
    } catch (error) {
      console.error('Error saving site name:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the site name",
        variant: "destructive"
      });
    }
  };
  
  // Apply the site name to the document title when component mounts
  useEffect(() => {
    document.title = siteName;
  }, [siteName]);

  const handleSaveSettings = async () => {
    try {
      // Save security settings to database
      const securitySettings = {
        auto_lock_enabled: autoLockEnabled,
        log_failed_logins: logFailedLogins,
        two_factor_auth: twoFactorAuth
      };
      
      // Save integration settings
      const integrationSettings = {
        google_analytics_id: googleAnalyticsId,
        webhook_url: webhookUrl,
        api_enabled: apiEnabled
      };
      
      // Here you would save these settings to your database
      // For demo purposes, we'll just show a toast message
      
      toast({
        title: "Saved",
        description: "Settings have been saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving settings",
        variant: "destructive"
      });
    }
  };

  const handleEnableMaintenanceMode = () => {
    setMaintenanceMode(true);
    toast({
      title: "Enabled",
      description: "Maintenance mode has been enabled",
      variant: "destructive"
    });
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="bg-card">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Appearance
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Integrations
        </TabsTrigger>
      </TabsList>

      {/* General Settings */}
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Site Name</CardTitle>
            <CardDescription>
              Change the site name displayed in the browser tab and throughout the UI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                value={siteName} 
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Site name"
                className="flex-1"
              />
              <Button onClick={handleSaveSiteName}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automatic Updates</CardTitle>
            <CardDescription>
              Manage system automatic updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  System Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic system updates
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Feature Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update new features
                </p>
              </div>
              <Switch checked={true} disabled={!isPro} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Update Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications when new updates are available
                </p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Appearance Settings */}
      <TabsContent value="appearance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the dashboard appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Dark / Light Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between dark and light mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage system security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Lock Inactive Sessions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically lock sessions after a period of inactivity
                </p>
              </div>
              <Switch checked={autoLockEnabled} onCheckedChange={setAutoLockEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Log Failed Login Attempts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Log failed login attempts for review
                </p>
              </div>
              <Switch checked={logFailedLogins} onCheckedChange={setLogFailedLogins} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require two-factor authentication for all admins
                </p>
              </div>
              <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} disabled={!isPro} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Password Management
                </Label>
                <p className="text-sm text-muted-foreground">
                  Set strong password policies
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Lock className="h-4 w-4" />
                Manage
              </Button>
            </div>

            {!isPro && (
              <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Advanced security features are available only in Pro plan.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Data Management */}
      <TabsContent value="data" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage system data and backups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Automatic Backup
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic data backup
                </p>
              </div>
              <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} disabled={!isPro} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Data Retention Period (days)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Set how long data is retained before automatic deletion
                </p>
              </div>
              <Input 
                type="number" 
                className="w-24" 
                value={dataRetention} 
                onChange={(e) => setDataRetention(parseInt(e.target.value))} 
                min={1}
                max={365}
                disabled={!autoDeleteEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Automatically Delete Old Data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically delete old data after retention period
                </p>
              </div>
              <Switch checked={autoDeleteEnabled} onCheckedChange={setAutoDeleteEnabled} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Button variant="outline" className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Backup Now
              </Button>
              
              <Button variant="destructive" className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Purge All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
            <CardDescription>
              Enable maintenance mode to prevent access to the system during updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to temporarily disable user access
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              {maintenanceMode && (
                <div className="bg-destructive/10 p-3 rounded-md text-sm flex items-start">
                  <FileWarning className="h-4 w-4 mr-2 text-destructive mt-0.5" />
                  <p className="text-destructive">
                    Warning: When maintenance mode is enabled, all users except admins will be prevented from accessing the system.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <Button 
                  disabled={maintenanceMode} 
                  onClick={handleEnableMaintenanceMode} 
                  variant="destructive" 
                  className="flex items-center"
                >
                  <Server className="h-4 w-4 mr-2" />
                  Enable Maintenance Mode
                </Button>
                
                <Button 
                  disabled={!maintenanceMode} 
                  variant="outline" 
                  className="flex items-center"
                >
                  <Server className="h-4 w-4 mr-2" />
                  Disable Maintenance Mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Integrations Tab */}
      <TabsContent value="integrations" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Manage API settings and accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Enable API
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow API access from external applications
                </p>
              </div>
              <Switch checked={apiEnabled} onCheckedChange={setApiEnabled} />
            </div>

            <div className="p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">
                    API Key
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Primary API key for authentication
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setApiKeysVisible(!apiKeysVisible)}
                >
                  {apiKeysVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="relative">
                <Input 
                  type={apiKeysVisible ? "text" : "password"} 
                  value="sk_live_51M8JkHKXCJJ7SsR2m6NtIdC0X3G" 
                  readOnly
                  className="font-mono bg-muted"
                />
                <Button 
                  className="absolute right-1 top-1 h-6" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("sk_live_51M8JkHKXCJJ7SsR2m6NtIdC0X3G");
                    toast({
                      title: "Copied!",
                      description: "API key copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              
              <div className="text-sm">
                <Button variant="outline" size="sm" className="mt-2">
                  Regenerate Key
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Warning: You will need to update integrations using this key.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="ga-id">
                  Google Analytics ID
                </Label>
                <Input 
                  id="ga-id"
                  value={googleAnalyticsId} 
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="webhook-url">
                  Webhook URL
                </Label>
                <Input 
                  id="webhook-url"
                  value={webhookUrl} 
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Important event notifications will be sent to this URL.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </Tabs>
  );
};

export default SystemSettingsExtended;
