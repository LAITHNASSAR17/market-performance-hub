
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface PreferenceData {
  theme: string;
  language: 'en';
  currency: string;
  timezone: string;
}

export function usePreferences() {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  
  const [preferenceData, setPreferenceData] = useState<PreferenceData>({
    theme: 'system',
    language: 'en',
    currency,
    timezone,
  });

  const updatePreference = async (prefData: PreferenceData) => {
    setIsSavingPreferences(true);
    try {
      setLanguage("en");
      setCurrency(prefData.currency);
      setTimezone(prefData.timezone);
      toast({
        title: "Success",
        description: "User preferences updated successfully",
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update user preferences",
        variant: "destructive",
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return {
    preferenceData,
    setPreferenceData,
    isSavingPreferences,
    updatePreference
  };
}
