
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
  const [theme, setTheme] = useState<Theme>('light'); // Set default theme to light

  const { user } = useAuth();
  const { toast } = useToast();

  // Load theme preference from Supabase when user logs in
  useEffect(() => {
    const loadThemePreference = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('theme')
            .eq('user_id', user.id as string)
            .maybeSingle();

          if (error) throw error;
          
          if (data?.theme) {
            setTheme(data.theme as Theme);
          } else {
            // Create initial preference if it doesn't exist
            try {
              const { error: insertError } = await supabase
                .from('user_preferences')
                .insert({
                  user_id: user.id,
                  theme: theme
                });
                
              if (insertError) throw insertError;
            } catch (insertErr) {
              console.error('Error creating theme preference:', insertErr);
            }
          }
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
      if (!user?.id) return; // Don't proceed if no user

      try {
        // Check if record exists first
        const { data: existingRecord, error: checkError } = await supabase
          .from('user_preferences')
          .select('user_id')
          .eq('user_id', user.id as string)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingRecord) {
          // Update the existing record
          const { error: updateError } = await supabase
            .from('user_preferences')
            .update({
              theme,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id as string);

          if (updateError) throw updateError;
        } else {
          // Insert a new record
          try {
            const { error: insertError } = await supabase
              .from('user_preferences')
              .insert({
                user_id: user.id,
                theme,
                updated_at: new Date().toISOString()
              });

            if (insertError) throw insertError;
          } catch (insertErr) {
            console.error('Error inserting theme preference:', insertErr);
          }
        }
      } catch (error) {
        console.error('Error updating theme preference:', error);
        // Silent error, don't show toast to avoid repeated error notifications
      }
    };

    // Only run after initial user load
    if (user?.id) {
      updateThemePreference();
    }
  }, [theme, user]);

  // Update the DOM when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Apply LTR direction since we only support English now
  useEffect(() => {
    const root = window.document.documentElement;
    root.dir = 'ltr';
    root.lang = 'en';
  }, []);

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
