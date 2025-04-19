
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Convert database response to match our SiteSettings type
      // We need to add company_email if it doesn't exist
      const formattedSettings: SiteSettings = {
        id: data.id,
        site_name: data.site_name,
        theme: data.theme || 'light',
        language: data.language || 'en',
        company_email: 'support@example.com', // Add default value since it's required by type
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setSettings(formattedSettings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setError('Failed to fetch site settings');
      
      // Create default settings object for fallback
      setSettings({
        id: 'default',
        site_name: 'Trading Platform',
        theme: 'light',
        language: 'en',
        company_email: 'support@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      if (!settings) throw new Error('No settings to update');

      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: newSettings.site_name || settings.site_name,
          theme: newSettings.theme || settings.theme,
          language: newSettings.language || settings.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      // Update local state
      setSettings({
        ...settings,
        ...newSettings,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Site settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast({
        title: "Error",
        description: "Failed to update site settings",
        variant: "destructive"
      });
    }
  };

  return { settings, loading, error, updateSettings };
};
