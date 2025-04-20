
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

interface SettingsContextType {
  siteSettings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      
      setSiteSettings(data);
      
      // Store site name in localStorage for easy access
      if (data?.site_name) {
        localStorage.setItem('siteName', data.site_name);
      }
    } catch (error: any) {
      console.error('Error fetching site settings:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to load site settings: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settings: Partial<SiteSettings>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', siteSettings?.id);
      
      if (error) throw error;
      
      // Refresh settings
      await fetchSettings();
      
      toast({
        title: "Success",
        description: "Site settings updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating site settings:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to update site settings: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{
      siteSettings,
      loading,
      error,
      fetchSettings,
      updateSettings
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
