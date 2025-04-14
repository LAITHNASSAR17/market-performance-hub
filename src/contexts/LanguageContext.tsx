
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type Language = 'en';

type TranslationsType = {
  [key: string]: {
    [key: string]: string;
  };
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: TranslationsType = {
  // Login page
  'login.title': {
    en: 'Trading Performance Platform',
  },
  'login.description': {
    en: 'Sign in to access your dashboard',
  },
  'login.email': {
    en: 'Email',
  },
  'login.password': {
    en: 'Password',
  },
  'login.forgotPassword': {
    en: 'Forgot password?',
  },
  'login.loginButton': {
    en: 'Sign in',
  },
  'login.loggingIn': {
    en: 'Signing in...',
  },
  'login.noAccount': {
    en: 'Don\'t have an account?',
  },
  'login.register': {
    en: 'Register',
  },
  'login.error.credentials': {
    en: 'Login failed. Please check your credentials.',
  },
  'login.error.emptyFields': {
    en: 'Please enter email and password',
  },
  
  // Forgot Password
  'forgotPassword.title': {
    en: 'Forgot Password',
  },
  'forgotPassword.description': {
    en: 'Enter your email address and we will send you a reset code.',
  },
  'forgotPassword.button': {
    en: 'Send Reset Code',
  },
  'forgotPassword.sending': {
    en: 'Sending...',
  },
  'forgotPassword.cancel': {
    en: 'Cancel',
  },
  
  // Reset Password
  'resetPassword.title': {
    en: 'Reset Password',
  },
  'resetPassword.description': {
    en: 'Enter the code sent to your email and create a new password.',
  },
  'resetPassword.code': {
    en: 'Reset Code',
  },
  'resetPassword.newPassword': {
    en: 'New Password',
  },
  'resetPassword.confirmPassword': {
    en: 'Confirm Password',
  },
  'resetPassword.button': {
    en: 'Reset Password',
  },
  'resetPassword.resetting': {
    en: 'Resetting...',
  },
  
  // Register page
  'register.title': {
    en: 'Create an Account',
  },
  'register.description': {
    en: 'Register to start tracking your trading performance',
  },
  'register.fullName': {
    en: 'Full Name',
  },
  'register.email': {
    en: 'Email',
  },
  'register.password': {
    en: 'Password',
  },
  'register.confirmPassword': {
    en: 'Confirm Password',
  },
  'register.createAccount': {
    en: 'Create Account',
  },
  'register.registering': {
    en: 'Registering...',
  },
  'register.haveAccount': {
    en: 'Already have an account?',
  },
  'register.login': {
    en: 'Log in',
  },
  
  // Dashboard and navigation
  'nav.dashboard': {
    en: 'Dashboard',
  },
  'nav.addTrade': {
    en: 'Add Trade',
  },
  'nav.trades': {
    en: 'Trades',
  },
  'nav.journal': {
    en: 'Daily Journal',
  },
  'nav.notebook': {
    en: 'Notebook',
  },
  'nav.reports': {
    en: 'Reports',
  },
  'nav.insights': {
    en: 'Insights',
  },
  'nav.adminPanel': {
    en: 'Admin Panel',
  },
  'nav.loggedInAs': {
    en: 'Logged in as',
  },
  'nav.logout': {
    en: 'Log out',
  },
  'nav.platform': {
    en: 'Trading Platform',
  },
  'nav.admin': {
    en: 'Admin',
  },
  // Chart page translations
  'chart.title': {
    en: 'Chart',
  },
  'chart.tradingViewChart': {
    en: 'Trading View Chart',
  },
  'chart.description': {
    en: 'Use TradingView chart for technical analysis and tracking financial markets',
  },
  'chart.forex': {
    en: 'Forex',
  },
  'chart.crypto': {
    en: 'Crypto',
  },
  'chart.stocks': {
    en: 'Stocks',
  },
  'chart.indices': {
    en: 'Indices',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const { user } = useAuth();
  const { toast } = useToast();

  // Load language preference from Supabase when user logs in
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('language')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          
          if (!data?.language) {
            // Create initial preference if it doesn't exist
            await supabase
              .from('user_preferences')
              .insert({ user_id: user.id, language });
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
        }
      }
    };

    loadLanguagePreference();
  }, [user]);

  // Update language in Supabase when it changes
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            language: lang,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      } catch (error) {
        console.error('Error updating language preference:', error);
        toast({
          title: "Error",
          description: "Failed to save language preference",
          variant: "destructive",
        });
      }
    }
  };

  // Set initial document direction
  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  const t = (key: string): string => {
    return translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
