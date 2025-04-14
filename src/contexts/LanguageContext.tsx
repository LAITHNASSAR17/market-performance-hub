import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define translations
const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome to TradeTracker',
    dashboard: 'Dashboard',
    trades: 'Trades',
    analytics: 'Analytics',
    journal: 'Journal',
    settings: 'Settings',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    'language.toggle': 'Toggle language',
    // ... add more translations as needed
  },
  ar: {
    welcome: 'مرحبًا بك في TradeTracker',
    dashboard: 'لوحة القيادة',
    trades: 'الصفقات',
    analytics: 'التحليلات',
    journal: 'السجل',
    settings: 'الإعدادات',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',
    'language.toggle': 'تبديل اللغة',
    // ... add more translations as needed
  }
};

// Define the context type
export interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;
  toggleLanguage: () => void;  // Add this method to the context type
}

// Create context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define props for the provider
interface LanguageProviderProps {
  children: ReactNode;
}

// Create provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Translate function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Function to toggle between languages
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create hook for using this context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
