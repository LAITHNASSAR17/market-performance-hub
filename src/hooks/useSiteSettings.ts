
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

interface SiteSettings {
  site_name: string;
  company_email: string;
  support_phone?: string;
  copyright_text?: string;
}

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as SiteSettings;
    }
  });

  // Use useEffect to update document title when settings are loaded
  useEffect(() => {
    if (settings?.site_name) {
      localStorage.setItem('siteName', settings.site_name);
      document.title = settings.site_name;
      
      // Update favicon if it exists in localStorage
      const favicon = localStorage.getItem('favicon');
      if (favicon) {
        updateFavicon(favicon);
      }
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<SiteSettings>) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update(newSettings)
        .eq('site_name', settings?.site_name || 'TradeTracker')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update localStorage and document title when settings are updated
      if (data?.site_name) {
        localStorage.setItem('siteName', data.site_name);
        document.title = data.site_name;
      }
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    }
  });

  // Function to update favicon
  const updateFavicon = (iconUrl: string) => {
    const linkElements = document.querySelectorAll("link[rel*='icon']");
    
    if (linkElements.length > 0) {
      // Update existing favicon links
      linkElements.forEach(link => {
        (link as HTMLLinkElement).href = iconUrl;
      });
    } else {
      // Create a new favicon link if none exists
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = iconUrl;
      document.head.appendChild(link);
    }
  };

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
    updateFavicon
  };
};
