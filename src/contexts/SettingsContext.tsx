
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  id: string;
  site_name: string;
  company_email: string;
  theme: string;
  language: string;
  logo_url?: string;
  favicon_url?: string;
  created_at: string;
  updated_at: string;
  currency?: string;
  timezone?: string;
  maintenance_mode?: boolean;
  terms_url?: string;
  privacy_url?: string;
  support_url?: string;
  default_user_role?: string;
  allow_registrations?: boolean;
  custom_domain?: string;
  google_analytics_id?: string;
  support_phone?: string;
  copyright_text?: string;
}

interface SettingsContextType {
  siteSettings: SiteSettings | null;
  loading: boolean;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSiteSettings(data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    try {
      if (!siteSettings?.id) throw new Error('No settings to update');

      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', siteSettings.id);

      if (error) throw error;
      
      setSiteSettings(prev => prev ? { ...prev, ...settings } : null);
      toast({ 
        title: "Success", 
        description: "Site settings updated successfully" 
      });
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update site settings", 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const refreshSettings = async () => {
    await fetchSiteSettings();
  };

  return (
    <SettingsContext.Provider value={{ 
      siteSettings, 
      loading, 
      updateSiteSettings,
      refreshSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
