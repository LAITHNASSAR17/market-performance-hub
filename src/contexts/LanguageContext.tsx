
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type Language = 'en';

const translations = {
  en: {
    // Dashboard translations
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of Your Trading Performance',
    
    // Timeframe selections
    'timeframe.all': 'All Time',
    'timeframe.week': 'Last 7 Days',
    'timeframe.month': 'Last 30 Days',
    'timeframe.quarter': 'Last 3 Months',
    'timeframe.year': 'Last Year',
    
    // Button and action texts
    'button.export_report': 'Export Report',
    'button.refresh': 'Refresh',
    
    // Stat card labels
    'stat.total_pl': 'Total P/L',
    'stat.profit_factor': 'Profit Factor',
    'stat.total_trades': 'Total Trades',
    
    // Trading insights
    'insights.title': 'Smart Trading Analysis',
    'insights.subtitle': 'Personalized Insights Based on Your Trading Patterns'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const { toast } = useToast();
  
  // Try to use Auth context, but don't error if it's not available yet
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // Auth context not available yet, which is fine
    console.log('Auth context not available yet in LanguageProvider');
  }

  useEffect(() => {
    setLanguage('en');
  }, []);

  const t = (key: string): string => {
    const langTranslations = translations[language];
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
