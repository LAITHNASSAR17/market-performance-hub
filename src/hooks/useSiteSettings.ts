
import { useState, useEffect } from 'react';
import { SiteSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';
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
  support_phone: '+1-800-TRADE',
  copyright_text: '© 2024 TradeTracker. All rights reserved.',
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

  const updateSettings = async (updatedSettings: SiteSettings) => {
    setIsUpdating(true);
    try {
      // In a real app, you would update your database
      // const { error } = await supabase.from('site_settings').update(updatedSettings).eq('id', updatedSettings.id);
      
      // For now, we'll use localStorage
      const completeSettings = { ...settings, ...updatedSettings, updated_at: new Date().toISOString() };
      localStorage.setItem('siteSettings', JSON.stringify(completeSettings));
      
      // Update site name in local storage for immediate use elsewhere
      localStorage.setItem('siteName', completeSettings.site_name);
      
      setSettings(completeSettings);
      
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

  const updateFavicon = async (file: File) => {
    try {
      // In a real implementation, you would upload the file to storage
      // const { data, error } = await supabase.storage
      //   .from('public')
      //   .upload(`favicons/${file.name}`, file);
      
      // For our mock implementation, we'll use a data URL
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Update the settings with the new favicon URL
          const updatedSettings = {
            ...settings,
            favicon_url: reader.result as string,
            updated_at: new Date().toISOString()
          };
          
          // Save the updated settings
          localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
          setSettings(updatedSettings);
          
          // Resolve with the URL
          resolve(reader.result as string);
          
          toast({
            title: 'Success',
            description: 'Favicon uploaded successfully',
          });
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload favicon',
        variant: 'destructive',
      });
      throw error;
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
