
import React from 'react';
import { Bell, Lock, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SystemSettings: React.FC = () => {
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
            <Input id="siteName" defaultValue="Trading Journal Platform" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Site Description</Label>
            <Input id="description" defaultValue="Track your trading journey and improve your performance" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowRegistration">Allow User Registration</Label>
              <p className="text-sm text-gray-500">Enable or disable new user registration</p>
            </div>
            <Switch id="allowRegistration" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Put site in maintenance mode</p>
            </div>
            <Switch id="maintenanceMode" />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full">Save Settings</Button>
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
            <Switch id="emailNotifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppNotifications">In-App Notifications</Label>
              <p className="text-sm text-gray-500">Show notifications in-app</p>
            </div>
            <Switch id="inAppNotifications" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Input id="welcomeMessage" defaultValue="Welcome to our Trading Journal Platform!" />
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Bell className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full">Save Notification Settings</Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-white shadow-sm md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Backup & Export</CardTitle>
          <CardDescription>Create and manage system backups</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <FileUp className="mr-2 h-4 w-4" />
              Export All Users
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <FileUp className="mr-2 h-4 w-4" />
              Export All Trades
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <FileUp className="mr-2 h-4 w-4" />
              Export All Notes
            </Button>
          </div>
          
          <div className="pt-4">
            <Button className="w-full md:w-auto" variant="default">
              Create Full System Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
