
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for system preference as default
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load theme preference from Supabase when user logs in
  useEffect(() => {
    const loadThemePreference = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('theme')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          
          if (data?.theme) {
            setTheme(data.theme as Theme);
          } else {
            // Create initial preference if it doesn't exist
            await supabase
              .from('user_preferences')
              .insert({ user_id: user.id, theme });
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
        }
      }
    };

    loadThemePreference();
  }, [user]);

  // Update theme in Supabase when it changes
  useEffect(() => {
    const updateThemePreference = async () => {
      if (user) {
        try {
          const { error } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              theme,
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
        } catch (error) {
          console.error('Error updating theme preference:', error);
          toast({
            title: "Error",
            description: "Failed to save theme preference",
            variant: "destructive",
          });
        }
      }
    };

    updateThemePreference();
  }, [theme, user]);

  // Update the DOM when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Apply RTL/LTR based on language
  useEffect(() => {
    const root = window.document.documentElement;
    if (language === 'ar') {
      root.dir = 'rtl';
      root.lang = 'ar';
    } else {
      root.dir = 'ltr';
      root.lang = 'en';
    }
  }, [language]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
