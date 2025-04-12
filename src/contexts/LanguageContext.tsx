import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

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
    ar: 'منصة أداء التداول',
    en: 'Trading Performance Platform',
  },
  'login.description': {
    ar: 'سجل الدخول للوصول إلى لوحة التحكم الخاصة بك',
    en: 'Sign in to access your dashboard',
  },
  'login.email': {
    ar: 'البريد الإلكتروني',
    en: 'Email',
  },
  'login.password': {
    ar: 'كلمة المرور',
    en: 'Password',
  },
  'login.forgotPassword': {
    ar: 'نسيت كلمة المرور؟',
    en: 'Forgot password?',
  },
  'login.loginButton': {
    ar: 'تسجيل الدخول',
    en: 'Sign in',
  },
  'login.loggingIn': {
    ar: 'جارٍ تسجيل الدخول...',
    en: 'Signing in...',
  },
  'login.noAccount': {
    ar: 'ليس لديك حساب؟',
    en: 'Don\'t have an account?',
  },
  'login.register': {
    ar: 'التسجيل',
    en: 'Register',
  },
  'login.error.credentials': {
    ar: 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.',
    en: 'Login failed. Please check your credentials.',
  },
  'login.error.emptyFields': {
    ar: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور',
    en: 'Please enter email and password',
  },
  
  // Forgot Password
  'forgotPassword.title': {
    ar: 'نسيت كلمة المرور',
    en: 'Forgot Password',
  },
  'forgotPassword.description': {
    ar: 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رمز إعادة التعيين.',
    en: 'Enter your email address and we will send you a reset code.',
  },
  'forgotPassword.button': {
    ar: 'إرسال رمز إعادة التعيين',
    en: 'Send Reset Code',
  },
  'forgotPassword.sending': {
    ar: 'جارٍ الإرسال...',
    en: 'Sending...',
  },
  'forgotPassword.cancel': {
    ar: 'إلغاء',
    en: 'Cancel',
  },
  
  // Reset Password
  'resetPassword.title': {
    ar: 'إعادة تعيين كلمة المرور',
    en: 'Reset Password',
  },
  'resetPassword.description': {
    ar: 'أدخل الرمز المرسل إلى بريدك الإلكتروني وأنشئ كلمة مرور جديدة.',
    en: 'Enter the code sent to your email and create a new password.',
  },
  'resetPassword.code': {
    ar: 'رمز إعادة التعيين',
    en: 'Reset Code',
  },
  'resetPassword.newPassword': {
    ar: 'كلمة المرور الجديدة',
    en: 'New Password',
  },
  'resetPassword.confirmPassword': {
    ar: 'تأكيد كلمة المرور',
    en: 'Confirm Password',
  },
  'resetPassword.button': {
    ar: 'إعادة تعيين كلمة المرور',
    en: 'Reset Password',
  },
  'resetPassword.resetting': {
    ar: 'جارٍ إعادة التعيين...',
    en: 'Resetting...',
  },
  
  // Register page
  'register.title': {
    ar: 'إنشاء حساب',
    en: 'Create an Account',
  },
  'register.description': {
    ar: 'سجل للبدء في تتبع أداء التداول الخاص بك',
    en: 'Register to start tracking your trading performance',
  },
  'register.fullName': {
    ar: 'الاسم الكامل',
    en: 'Full Name',
  },
  'register.email': {
    ar: 'البريد الإلكتروني',
    en: 'Email',
  },
  'register.password': {
    ar: 'كلمة المرور',
    en: 'Password',
  },
  'register.confirmPassword': {
    ar: 'تأكيد كلمة المرور',
    en: 'Confirm Password',
  },
  'register.createAccount': {
    ar: 'إنشاء حساب',
    en: 'Create Account',
  },
  'register.registering': {
    ar: 'جارٍ التسجيل...',
    en: 'Registering...',
  },
  'register.haveAccount': {
    ar: 'لديك حساب بالفعل؟',
    en: 'Already have an account?',
  },
  'register.login': {
    ar: 'تسجيل الدخول',
    en: 'Log in',
  },
  
  // Dashboard and navigation
  'nav.dashboard': {
    ar: 'لوحة المعلومات',
    en: 'Dashboard',
  },
  'nav.addTrade': {
    ar: 'إضافة صفقة',
    en: 'Add Trade',
  },
  'nav.trades': {
    ar: 'الصفقات',
    en: 'Trades',
  },
  'nav.journal': {
    ar: 'المذكرة اليومية',
    en: 'Daily Journal',
  },
  'nav.notebook': {
    ar: 'دفتر الملاحظات',
    en: 'Notebook',
  },
  'nav.reports': {
    ar: 'التقارير',
    en: 'Reports',
  },
  'nav.insights': {
    ar: 'الرؤى والتحليلات',
    en: 'Insights',
  },
  'nav.adminPanel': {
    ar: 'لوحة الإدارة',
    en: 'Admin Panel',
  },
  'nav.loggedInAs': {
    ar: 'مسجل الدخول كـ',
    en: 'Logged in as',
  },
  'nav.logout': {
    ar: 'تسجيل الخروج',
    en: 'Log out',
  },
  'nav.platform': {
    ar: 'منصة التداول',
    en: 'Trading Platform',
  },
  'nav.admin': {
    ar: 'مسؤول',
    en: 'Admin',
  },
  // Chart page translations
  'chart.title': {
    ar: 'الشارت',
    en: 'Chart',
  },
  'chart.tradingViewChart': {
    ar: 'مخطط التداول',
    en: 'Trading View Chart',
  },
  'chart.description': {
    ar: 'استخدم مخطط TradingView للتحليل الفني وتتبع الأسواق المالية',
    en: 'Use TradingView chart for technical analysis and tracking financial markets',
  },
  'chart.forex': {
    ar: 'العملات',
    en: 'Forex',
  },
  'chart.crypto': {
    ar: 'العملات الرقمية',
    en: 'Crypto',
  },
  'chart.stocks': {
    ar: 'الأسهم',
    en: 'Stocks',
  },
  'chart.indices': {
    ar: 'المؤشرات',
    en: 'Indices',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // استعادة اللغة المخزنة أو استخدام عربي كافتراضي
    const storedLanguage = localStorage.getItem('language');
    return (storedLanguage as Language) || 'ar';
  });

  // تحديث اللغة وحفظها في التخزين المحلي
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // تعيين اتجاه المستند بناءً على اللغة
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // تعيين اتجاه المستند عند التحميل الأولي
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // وظيفة الترجمة
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
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
