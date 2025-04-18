import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

// Define language type as only English now
type Language = 'en';

// English translations only
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.myProfile': 'My Profile',
    'nav.settings': 'Settings',
    'nav.insights': 'Insights',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.adminDashboard': 'Admin Dashboard',
    
    // Dashboard
    'dashboard.greeting': 'Hello',
    'dashboard.welcome': 'Welcome back to your trading dashboard',
    'dashboard.recentTrades': 'Recent Trades',
    'dashboard.noTrades': 'No trades yet. Add your first trade to get started!',
    'dashboard.viewAll': 'View All Trades',
    'dashboard.addTrade': 'Add Trade',
    'dashboard.editTrade': 'Edit Trade',
    'dashboard.delete': 'Delete',
    'dashboard.edit': 'Edit',
    'dashboard.confirmDelete': 'Are you sure you want to delete this trade? This action cannot be undone.',
    'dashboard.todayOverview': 'Today\'s Overview',
    'dashboard.performance': 'Performance',
    'dashboard.statistics': 'Statistics',
    'dashboard.date': 'Date',
    'dashboard.pair': 'Pair',
    'dashboard.entry': 'Entry',
    'dashboard.exit': 'Exit',
    'dashboard.type': 'Type',
    'dashboard.result': 'Result',
    'dashboard.notes': 'Notes',
    'dashboard.tradeSuccessTitle': 'Trade Added Successfully',
    'dashboard.tradeSuccessMsg': 'Your trade has been recorded and is now visible in your dashboard.',
    'dashboard.tradeUpdateTitle': 'Trade Updated Successfully',
    'dashboard.tradeUpdateMsg': 'Your trade has been updated and the changes are now reflected in your dashboard.',
    'dashboard.tradeDeleteTitle': 'Trade Deleted',
    'dashboard.tradeDeleteMsg': 'Your trade has been permanently deleted.',
    'dashboard.buy': 'Buy',
    'dashboard.sell': 'Sell',
    'dashboard.profitLoss': 'Profit/Loss',
    'dashboard.hashtags': 'Hashtags',
    'dashboard.addHashtags': 'Add hashtags',
    
    // Login
    'login.title': 'Welcome Back',
    'login.description': 'Sign in to access your trading dashboard',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.forgotPassword': 'Forgot password?',
    'login.loginButton': 'Sign In',
    'login.loggingIn': 'Signing in...',
    'login.noAccount': 'Don\'t have an account?',
    'login.register': 'Create an account',
    'login.error.emptyFields': 'Email and password are required',
    'login.error.credentials': 'Invalid email or password',
    'login.error.invalidEmail': 'Please enter a valid email address',
    
    // Register
    'register.title': 'Create an Account',
    'register.description': 'Sign up to start tracking your trades',
    'register.fullName': 'Full Name',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.createAccount': 'Create Account',
    'register.registering': 'Creating account...',
    'register.haveAccount': 'Already have an account?',
    'register.login': 'Sign in',
    'register.error.fillAll': 'Please fill all fields',
    'register.error.passwordMismatch': 'Passwords do not match',
    'register.error.passwordLength': 'Password must be at least 6 characters',
    'register.error.failed': 'Registration failed. Please try again.',
    
    // Forgot/Reset Password
    'forgotPassword.title': 'Forgot Password',
    'forgotPassword.description': 'Enter your email address to receive a password reset code',
    'forgotPassword.button': 'Send Reset Code',
    'forgotPassword.sending': 'Sending...',
    'forgotPassword.cancel': 'Cancel',
    'resetPassword.title': 'Reset Password',
    'resetPassword.description': 'Enter the reset code sent to your email along with your new password',
    'resetPassword.code': 'Reset Code',
    'resetPassword.newPassword': 'New Password',
    'resetPassword.confirmPassword': 'Confirm New Password',
    'resetPassword.button': 'Reset Password',
    'resetPassword.resetting': 'Resetting...',
    'resetPassword.error.codeLength': 'Please enter a valid reset code',
    'resetPassword.error.passwordLength': 'Password must be at least 6 characters',
    'resetPassword.error.passwordMismatch': 'Passwords do not match',
    
    // Profile/Settings
    'profile.title': 'My Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.accountSettings': 'Account Settings',
    'profile.preferences': 'Preferences',
    'profile.security': 'Security',
    'profile.notifications': 'Notifications',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.save': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.success': 'Settings saved successfully',
    
    // Theme toggle
    'theme.toggle': 'Toggle theme',
    'theme.lightMode': 'Light mode',
    'theme.darkMode': 'Dark mode',
    
    // Analytics section translations
    'analytics.title': 'Analytics',
    'analytics.subtitle': 'Track your trading performance and insights',
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
  const { user } = useAuth();

  // Load language preference from localStorage or default to 'en'
  useEffect(() => {
    // Just set to English since we only support English now
    setLanguage('en');
  }, []);

  // Save language preference to Supabase if user is logged in
  useEffect(() => {
    const saveLanguagePreference = async () => {
      if (user) {
        try {
          const { data: existingRecord } = await supabase
            .from('user_preferences')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingRecord) {
            // Update the existing record
            await supabase
              .from('user_preferences')
              .update({
                language,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
          } else {
            // Insert a new record
            await supabase
              .from('user_preferences')
              .insert({
                user_id: user.id,
                language,
                updated_at: new Date().toISOString()
              });
          }
        } catch (error) {
          console.error('Error saving language preference:', error);
        }
      }
    };

    saveLanguagePreference();
  }, [language, user]);

  // Translation function
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
