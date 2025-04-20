
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export const useSiteSettings = () => {
  const settingsContext = useSettings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!settingsContext.loading) {
      setLoading(false);
    }
  }, [settingsContext.loading]);

  return {
    siteSettings: settingsContext.siteSettings,
    loading,
    error: settingsContext.error,
    updateSettings: settingsContext.updateSettings
  };
};
