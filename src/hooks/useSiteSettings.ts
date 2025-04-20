
import { useState, useEffect } from 'react';
import { SiteSettings } from '@/types/settings';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

// Default site settings
const defaultSettings: SiteSettings = {
  id: '1',
  site_name: 'TradeTracker',
  company_email: 'support@tradetracker.com',
  theme: 'light',
  language: 'en',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  currency: 'USD',
  timezone: 'UTC',
  maintenance_mode: false,
  allow_registrations: true,
  default_user_role: 'user',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from your database
      // const { data, error } = await supabase.from('site_settings').select('*').single();
      
      // For now, we'll use localStorage to persist settings
      const storedSettings = localStorage.getItem('siteSettings');
      
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        // Initialize with default settings if none exist
        localStorage.setItem('siteSettings', JSON.stringify(defaultSettings));
      }
      
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load site settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedSettings: Partial<SiteSettings>) => {
    setIsUpdating(true);
    try {
      // Merge current settings with updates
      const newSettings = { 
        ...settings, 
        ...updatedSettings,
        updated_at: new Date().toISOString()
      };
      
      // In a real app, you would update your database
      // const { error } = await supabase.from('site_settings').update(newSettings).eq('id', settings.id);
      
      // For now, we'll use localStorage
      localStorage.setItem('siteSettings', JSON.stringify(newSettings));
      
      // Update site name in local storage for immediate use elsewhere
      if (updatedSettings.site_name) {
        localStorage.setItem('siteName', updatedSettings.site_name);
      }
      
      setSettings(newSettings);
      
      toast({
        title: 'Success',
        description: 'Site settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update site settings',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateFavicon = async (faviconData: string | File) => {
    setIsUpdating(true);
    try {
      let faviconUrl: string;
      
      // Handle File or string (URL) input
      if (typeof faviconData === 'string') {
        faviconUrl = faviconData;
      } else {
        // In a real implementation, you would upload the file to storage
        // For our mock implementation, we'll use a data URL
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Get URL from file reader
            faviconUrl = reader.result as string;
            
            // Update the settings with the new favicon URL
            const updatedSettings = {
              ...settings,
              favicon_url: faviconUrl,
              updated_at: new Date().toISOString()
            };
            
            // Save the updated settings
            localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
            setSettings(updatedSettings);
            
            // Resolve with the URL
            resolve(faviconUrl);
            
            toast({
              title: 'Success',
              description: 'Favicon uploaded successfully',
            });
          };
          reader.readAsDataURL(faviconData);
        });
      }
      
      // If we have a direct URL (string input)
      const updatedSettings = {
        ...settings,
        favicon_url: faviconUrl,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast({
        title: 'Success',
        description: 'Favicon updated successfully',
      });
      
      return faviconUrl;
    } catch (error) {
      console.error('Error updating favicon:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favicon',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    isUpdating,
    updateSettings,
    updateFavicon
  };
};

export default useSiteSettings;
