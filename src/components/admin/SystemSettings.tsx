
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Save, Image } from 'lucide-react';
import FaviconUpload from '@/components/FaviconUpload';

const SystemSettings: React.FC = () => {
  const { toast } = useToast();
  const { siteSettings, updateSettings, loading } = useSiteSettings();
  const [siteName, setSiteName] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showFaviconUpload, setShowFaviconUpload] = useState(false);
  
  useEffect(() => {
    if (siteSettings?.site_name) {
      setSiteName(siteSettings.site_name);
    }
  }, [siteSettings]);

  const handleSaveSettings = async () => {
    try {
      console.log('Saving site name:', siteName);
      // Use the updateSettings function from the hook
      updateSettings({ 
        site_name: siteName,
        company_email: siteSettings?.company_email || '',
        theme: siteSettings?.theme || 'light',
        language: siteSettings?.language || 'en'
      });
      
      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
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
          <Switch 
            id="maintenance" 
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
        </div>

        <div className="pt-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFaviconUpload(true)}
          >
            <Image className="h-4 w-4" />
            Change Website Favicon
          </Button>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>

      <FaviconUpload 
        isOpen={showFaviconUpload} 
        onClose={() => setShowFaviconUpload(false)} 
      />
    </Card>
  );
};

export default SystemSettings;
