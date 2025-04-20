
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/types/settings';

export const useSiteSettings = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      if (data) {
        setSiteSettings(data as SiteSettings);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (updatedSettings: Partial<SiteSettings>) => {
    if (!siteSettings?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(updatedSettings)
        .eq('id', siteSettings.id);

      if (error) throw error;
      
      // Update local state
      setSiteSettings(prev => prev ? { ...prev, ...updatedSettings } : null);
      
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
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
      if (siteSettings) {
        updateSettings({ favicon_url: faviconUrl });
      }
      
      return true;
    } catch (err) {
      console.error('Error updating favicon:', err);
      return false;
    }
  };

  return {
    siteSettings,
    loading,
    error,
    updateSettings,
    updateFavicon,
    fetchSettings
  };
};

// Export a default version for easier imports
export default useSiteSettings;
