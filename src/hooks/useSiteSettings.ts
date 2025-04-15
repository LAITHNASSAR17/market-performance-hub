
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
    },
    onSuccess: (data) => {
      // Update localStorage and document title when settings are fetched
      if (data?.site_name) {
        localStorage.setItem('siteName', data.site_name);
        document.title = data.site_name;
      }
    }
  });

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

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending
  };
};
