
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  // Always initialize with light theme
  const [theme, setTheme] = useState<Theme>('light');

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
          
          // Always set light theme regardless of stored preferences
          if (data?.theme !== 'light') {
            // Update to light theme in database
            await supabase
              .from('user_preferences')
              .upsert({ 
                user_id: user.id, 
                theme: 'light',
                updated_at: new Date().toISOString()
              });
          }
          
          setTheme('light');
        } catch (error) {
          console.error('Error loading theme preference:', error);
        }
      }
    };

    loadThemePreference();
  }, [user]);

  // Update theme in Supabase when it changes - with better error handling
  useEffect(() => {
    const updateThemePreference = async () => {
      if (!user) return; // Don't proceed if no user

      try {
        // Check if record exists first
        const { data: existingRecord } = await supabase
          .from('user_preferences')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingRecord) {
          // Update the existing record
          const { error } = await supabase
            .from('user_preferences')
            .update({
              theme: 'light', // Always save as light
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (error) throw error;
        } else {
          // Insert a new record
          const { error } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              theme: 'light',
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error updating theme preference:', error);
        // Silent error, don't show toast to avoid repeated error notifications
      }
    };

    // Only run after initial user load
    if (user) {
      updateThemePreference();
    }
  }, [user]);

  // Update the DOM when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light'); // Always add light class
  }, []);

  // Apply LTR direction since we only support English now
  useEffect(() => {
    const root = window.document.documentElement;
    root.dir = 'ltr';
    root.lang = 'en';
  }, []);

  // Toggle theme function (won't actually toggle in this case)
  const toggleTheme = () => {
    // Always set to light theme
    setTheme('light');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme, setTheme }}>
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
