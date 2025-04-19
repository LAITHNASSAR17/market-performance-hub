
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  const [theme, setTheme] = useState<Theme>('light');
  const { user } = useAuth();
  const { toast } = useToast();

  // Load theme preference from localStorage first, then try to sync with database
  useEffect(() => {
    const loadTheme = async () => {
      // Set system preference as default
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);

      if (user) {
        try {
          const { data, error } = await supabase
            .from('site_settings')
            .select('theme')
            .maybeSingle();

          if (!error && data?.theme) {
            setTheme(data.theme as Theme);
          }
        } catch (error) {
          console.error('Error loading theme:', error);
        }
      }
    };

    loadTheme();
  }, [user]);

  // Update theme in database when it changes
  useEffect(() => {
    const updateThemePreference = async () => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ theme, updated_at: new Date().toISOString() });

        if (error) throw error;
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    };

    updateThemePreference();
  }, [theme, user]);

  // Update DOM when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

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
