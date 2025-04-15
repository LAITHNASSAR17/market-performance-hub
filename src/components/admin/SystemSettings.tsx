
import React from 'react';
import { Bell, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
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
  const [siteName, setSiteName] = React.useState(localStorage.getItem('siteName') || 'TradeTracker');
  
  const handleSaveSettings = async () => {
    try {
      // Update site_settings table
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          site_name: siteName
        });

      if (error) throw error;

      // Update localStorage
      localStorage.setItem('siteName', siteName);
      
      // Update document title
      document.title = siteName;

      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully"
      });

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Configure global site settings</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input 
              id="siteName" 
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site name"
            />
            <p className="text-sm text-gray-500">
              This name will be used across the entire platform
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
            </div>
            <Switch id="maintenance" />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Backup and Export</CardTitle>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
