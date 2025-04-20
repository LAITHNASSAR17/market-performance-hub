
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/types/settings';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings(data as SiteSettings);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError('Failed to load settings');
    }
  };

  // Update settings
  const updateSettings = async (updatedSettings: Partial<SiteSettings>) => {
    if (!settings?.id) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(updatedSettings)
        .eq('id', settings.id);

      if (error) throw error;
      
      // Update local state
      setSettings(prev => prev ? { ...prev, ...updatedSettings } : null);
      
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update the favicon
  const updateFavicon = (faviconUrl: string) => {
    try {
      // Update favicon in the document
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.setAttribute('rel', 'shortcut icon');
      link.setAttribute('href', faviconUrl);
      document.getElementsByTagName('head')[0].appendChild(link);
      
      // Optionally update in settings if needed
      if (settings) {
        updateSettings({ favicon_url: faviconUrl });
      }
      
      return true;
    } catch (err) {
      console.error('Error updating favicon:', err);
      return false;
    }
  };

  return {
    settings,
    isUpdating,
    error,
    updateSettings,
    updateFavicon,
    fetchSettings
  };
};

export default useSiteSettings;
