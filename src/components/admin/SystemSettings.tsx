
import React, { useState, useEffect } from 'react';
import { Bell, Lock, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SystemSettings: React.FC = () => {
  const { toast } = useToast();

  // State for general settings
  const [siteName, setSiteName] = useState('Trading Journal Platform');
  const [description, setDescription] = useState('Track your trading journey and improve your performance');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // State for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to our Trading Journal Platform!');

  // Load settings from local storage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      // General settings
      setSiteName(settings.siteName || 'Trading Journal Platform');
      setDescription(settings.description || 'Track your trading journey and improve your performance');
      setAllowRegistration(settings.allowRegistration !== undefined ? settings.allowRegistration : true);
      setMaintenanceMode(settings.maintenanceMode || false);
      
      // Notification settings
      setEmailNotifications(settings.emailNotifications !== undefined ? settings.emailNotifications : true);
      setInAppNotifications(settings.inAppNotifications !== undefined ? settings.inAppNotifications : true);
      setWelcomeMessage(settings.welcomeMessage || 'Welcome to our Trading Journal Platform!');
    }
  }, []);

  const saveGeneralSettings = () => {
    const settings = {
      siteName,
      description,
      allowRegistration,
      maintenanceMode,
      emailNotifications,
      inAppNotifications,
      welcomeMessage
    };
    
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    toast({
      title: "Settings Saved",
      description: "Your general settings have been saved successfully",
    });
  };

  const saveNotificationSettings = () => {
    const settings = {
      siteName,
      description,
      allowRegistration,
      maintenanceMode,
      emailNotifications,
      inAppNotifications,
      welcomeMessage
    };
    
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    toast({
      title: "Notification Settings Saved",
      description: "Your notification settings have been saved successfully",
    });
  };

  const sendTestNotification = () => {
    toast({
      title: "Test Notification",
      description: welcomeMessage,
    });
  };

  const exportData = (dataType: string) => {
    toast({
      title: `Export ${dataType}`,
      description: `Exporting ${dataType} data...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${dataType} data has been exported successfully`,
      });
    }, 1500);
  };

  const createBackup = () => {
    toast({
      title: "Creating Backup",
      description: "Creating full system backup...",
    });
    
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "System backup has been created successfully",
      });
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage general system settings</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input 
              id="siteName" 
              value={siteName} 
              onChange={(e) => setSiteName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Site Description</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowRegistration">Allow User Registration</Label>
              <p className="text-sm text-gray-500">Enable or disable new user registration</p>
            </div>
            <Switch 
              id="allowRegistration" 
              checked={allowRegistration}
              onCheckedChange={setAllowRegistration}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Put site in maintenance mode</p>
            </div>
            <Switch 
              id="maintenanceMode" 
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" onClick={saveGeneralSettings}>Save Settings</Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure notification system</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">Send notifications via email</p>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppNotifications">In-App Notifications</Label>
              <p className="text-sm text-gray-500">Show notifications in-app</p>
            </div>
            <Switch 
              id="inAppNotifications" 
              checked={inAppNotifications}
              onCheckedChange={setInAppNotifications}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Input 
              id="welcomeMessage" 
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={sendTestNotification}
            >
              <Bell className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" onClick={saveNotificationSettings}>Save Notification Settings</Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-white shadow-sm md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Backup & Export</CardTitle>
          <CardDescription>Create and manage system backups</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center"
              onClick={() => exportData('Users')}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Export All Users
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center"
              onClick={() => exportData('Trades')}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Export All Trades
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center"
              onClick={() => exportData('Notes')}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Export All Notes
            </Button>
          </div>
          
          <div className="pt-4">
            <Button 
              className="w-full md:w-auto" 
              variant="default"
              onClick={createBackup}
            >
              Create Full System Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
