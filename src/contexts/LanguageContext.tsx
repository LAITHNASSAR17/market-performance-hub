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
  // Login page translations - keep existing translations

  // ... keep existing code (login, forgot password, reset password, register translations)
  
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
  'nav.analytics': {
    ar: 'التحليلات',
    en: 'Analytics',
  },
  'nav.chart': {
    ar: 'الشارت',
    en: 'Chart',
  },
  'nav.subscriptions': {
    ar: 'الاشتراكات',
    en: 'Subscriptions',
  },
  'nav.settings': {
    ar: 'الإعدادات',
    en: 'Settings',
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
  'chart.selectSymbolType': {
    ar: 'اختر نوع الرمز',
    en: 'Select symbol type',
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
  'chart.tradeLoaded': {
    ar: 'تم تحميل الصفقة',
    en: 'Trade loaded',
  },
  'chart.tradeDisplayed': {
    ar: 'تم عرض الصفقة على الشارت',
    en: 'Trade displayed on chart',
  },
  'chart.useControls': {
    ar: 'استخدم أدوات التحكم لمشاهدة الصفقة',
    en: 'Use controls to view the trade',
  },
  
  // Add Trade page translations
  'addTrade.title': {
    ar: 'إضافة صفقة جديدة',
    en: 'Add New Trade',
  },
  'addTrade.description': {
    ar: 'سجل تفاصيل عن صفقتك',
    en: 'Record details about your trade',
  },
  'addTrade.tradeInformation': {
    ar: 'معلومات الصفقة',
    en: 'Trade Information',
  },
  'addTrade.account': {
    ar: 'الحساب',
    en: 'Account',
  },
  'addTrade.selectAccount': {
    ar: 'اختر الحساب',
    en: 'Select account',
  },
  'addTrade.date': {
    ar: 'التاريخ',
    en: 'Date',
  },
  'addTrade.currencyPair': {
    ar: 'زوج العملات / الرمز',
    en: 'Currency Pair / Symbol',
  },
  'addTrade.selectOrType': {
    ar: 'اختر أو اكتب زوج العملات',
    en: 'Select or type currency pair',
  },
  'addTrade.type': {
    ar: 'النوع',
    en: 'Type',
  },
  'addTrade.buy': {
    ar: 'شراء',
    en: 'Buy',
  },
  'addTrade.sell': {
    ar: 'بيع',
    en: 'Sell',
  },
  'addTrade.entryPrice': {
    ar: 'سعر الدخول',
    en: 'Entry Price',
  },
  'addTrade.exitPrice': {
    ar: 'سعر الخروج',
    en: 'Exit Price',
  },
  'addTrade.lotSize': {
    ar: 'حجم العقد',
    en: 'Lot Size',
  },
  'addTrade.stopLoss': {
    ar: 'وقف الخسارة (اختياري)',
    en: 'Stop Loss (optional)',
  },
  'addTrade.takeProfit': {
    ar: 'جني الأرباح (اختياري)',
    en: 'Take Profit (optional)',
  },
  'addTrade.riskPercentage': {
    ar: 'نسبة المخاطرة %',
    en: 'Risk %',
  },
  'addTrade.profitLoss': {
    ar: 'الربح/الخسارة',
    en: 'Profit/Loss',
  },
  'addTrade.duration': {
    ar: 'المدة (بالدقائق)',
    en: 'Duration (minutes)',
  },
  'addTrade.notes': {
    ar: 'الملاحظات',
    en: 'Notes',
  },
  'addTrade.notesPlaceholder': {
    ar: 'أدخل ملاحظات الصفقة أو الملاحظات أو أسباب الدخول في الصفقة',
    en: 'Enter trade notes, observations, or reasons for taking the trade',
  },
  'addTrade.hashtags': {
    ar: 'الوسوم',
    en: 'Hashtags',
  },
  'addTrade.hashtagsPlaceholder': {
    ar: 'أضف وسوم (مثل الإعداد، الاختراق، الخطأ)',
    en: 'Add hashtags (e.g. setup, breakout, mistake)',
  },
  'addTrade.tradeImages': {
    ar: 'صور الصفقة',
    en: 'Trade Images',
  },
  'addTrade.beforeTradeImage': {
    ar: 'صورة ما قبل الصفقة',
    en: 'Before Trade Image',
  },
  'addTrade.afterTradeImage': {
    ar: 'صورة ما بعد الصفقة',
    en: 'After Trade Image',
  },
  'addTrade.additionalImage': {
    ar: 'صورة إضافية (اختياري)',
    en: 'Additional Image (Optional)',
  },
  'addTrade.cancel': {
    ar: 'إلغاء',
    en: 'Cancel',
  },
  'addTrade.saveTrade': {
    ar: 'حفظ الصفقة',
    en: 'Save Trade',
  },
  'addTrade.tradeAdded': {
    ar: 'تمت إضافة الصفقة',
    en: 'Trade Added',
  },
  'addTrade.tradeAddedSuccess': {
    ar: 'تمت إضافة صفقتك بنجاح',
    en: 'Your trade has been added successfully',
  },
  'addTrade.accountRequired': {
    ar: 'الحساب مطلوب',
    en: 'Account is required',
  },
  'addTrade.pairRequired': {
    ar: 'زوج العملات أو الرمز مطلوب',
    en: 'Currency pair or symbol is required',
  },
  'addTrade.entryRequired': {
    ar: 'سعر الدخول مطلوب',
    en: 'Entry price is required',
  },
  'addTrade.exitRequired': {
    ar: 'سعر الخروج مطلوب',
    en: 'Exit price is required',
  },
  'addTrade.lotSizeRequired': {
    ar: 'حجم العقد مطلوب',
    en: 'Lot size is required',
  },
  'addTrade.searchSymbols': {
    ar: 'بحث عن الرموز...',
    en: 'Search symbols...',
  },
  'addTrade.noResults': {
    ar: 'لم يتم العثور على نتائج. اكتب لإضافة رمز مخصص.',
    en: 'No results found. Type to add a custom symbol.',
  },

  // Settings page translations
  'settings.accountSettings': {
    ar: 'إعدادات الحساب',
    en: 'Account Settings',
  },
  'settings.manageAccount': {
    ar: 'إدارة إعدادات حسابك وتفضيلاتك',
    en: 'Manage your account settings and preferences',
  },
  'settings.profileInformation': {
    ar: 'معلومات الملف الشخصي',
    en: 'Profile Information',
  },
  'settings.managePersonalInfo': {
    ar: 'إدارة معلوماتك الشخصية وإعدادات البريد الإلكتروني',
    en: 'Manage your personal information and email settings',
  },
  'settings.username': {
    ar: 'اسم المستخدم',
    en: 'Username',
  },
  'settings.emailAddress': {
    ar: 'البريد الإلكتروني',
    en: 'Email Address',
  },
  'settings.accountType': {
    ar: 'نوع الحساب',
    en: 'Account Type',
  },
  'settings.administrator': {
    ar: 'مسؤول',
    en: 'Administrator',
  },
  'settings.standardUser': {
    ar: 'مستخدم عادي',
    en: 'Standard User',
  },
  'settings.editProfile': {
    ar: 'تعديل الملف الشخصي',
    en: 'Edit Profile',
  },
  'settings.displaySettings': {
    ar: 'إعدادات العرض',
    en: 'Display Settings',
  },
  'settings.customizeAppearance': {
    ar: 'تخصيص مظهر لوحة التحكم الخاصة بك',
    en: 'Customize the appearance of your dashboard',
  },
  'settings.darkMode': {
    ar: 'الوضع الداكن',
    en: 'Dark Mode',
  },
  'settings.switchTheme': {
    ar: 'التبديل بين السمة الفاتحة والداكنة',
    en: 'Switch between light and dark theme',
  },
  'settings.language': {
    ar: 'اللغة',
    en: 'Language',
  },
  'settings.switchLanguage': {
    ar: 'التبديل بين العربية والإنجليزية',
    en: 'Switch between Arabic and English',
  },
  'settings.notifications': {
    ar: 'الإشعارات',
    en: 'Notifications',
  },
  'settings.manageNotifications': {
    ar: 'إدارة كيفية تلقي الإشعارات والتنبيهات',
    en: 'Manage how you receive notifications and alerts',
  },
  'settings.tradeAlerts': {
    ar: 'تنبيهات الصفقات',
    en: 'Trade Alerts',
  },
  'settings.receiveTradeNotifications': {
    ar: 'تلقي إشعارات حول صفقاتك',
    en: 'Receive notifications about your trades',
  },
  'settings.systemUpdates': {
    ar: 'تحديثات النظام',
    en: 'System Updates',
  },
  'settings.importantUpdates': {
    ar: 'تحديثات وإعلانات مهمة',
    en: 'Important updates and announcements',
  },
  'settings.marketNews': {
    ar: 'أخبار السوق',
    en: 'Market News',
  },
  'settings.latestNews': {
    ar: 'أحدث الأخبار عن الأسواق والأصول',
    en: 'Latest news about markets and assets',
  },
  'settings.emailDigest': {
    ar: 'ملخص البريد الإلكتروني',
    en: 'Email Digest',
  },
  'settings.weeklySummary': {
    ar: 'ملخص أسبوعي لنشاط التداول الخاص بك',
    en: 'Weekly summary of your trading activity',
  },
  'settings.updated': {
    ar: 'تم تحديث الإعدادات',
    en: 'Settings Updated',
  },
  'settings.updatedSuccess': {
    ar: 'تم تحديث إعداداتك بنجاح',
    en: 'Your settings have been updated successfully',
  },
  'settings.updateFailed': {
    ar: 'فشل التحديث',
    en: 'Update Failed',
  },
  'settings.updateFailedDesc': {
    ar: 'فشل في تحديث إعداداتك. يرجى المحاولة مرة أخرى.',
    en: 'Failed to update your settings. Please try again.',
  },
  'settings.notificationsUpdated': {
    ar: 'تم تحديث إعدادات الإشعارات',
    en: 'Notification Settings Updated',
  },
  'settings.notificationsPreferencesSaved': {
    ar: 'تم حفظ تفضيلات الإشعارات الخاصة بك',
    en: 'Your notification preferences have been saved',
  },

  // Subscription page translations
  'subscription.title': {
    ar: 'اختر خطة الاشتراك الخاصة بك',
    en: 'Choose Your Subscription Plan',
  },
  'subscription.description': {
    ar: 'ارتقِ بتجربة التداول الخاصة بك مع خططنا المميزة. اختر الخيار الذي يناسب أسلوب التداول وأهدافك بشكل أفضل.',
    en: 'Elevate your trading experience with our premium plans. Select the option that best fits your trading style and goals.',
  },
  'subscription.basic': {
    ar: 'أساسي',
    en: 'Basic',
  },
  'subscription.professional': {
    ar: 'محترف',
    en: 'Professional',
  },
  'subscription.enterprise': {
    ar: 'مؤسسة',
    en: 'Enterprise',
  },
  'subscription.price.basic': {
    ar: '$9.99',
    en: '$9.99',
  },
  'subscription.price.professional': {
    ar: '$19.99',
    en: '$19.99',
  },
  'subscription.price.enterprise': {
    ar: '$39.99',
    en: '$39.99',
  },
  'subscription.period': {
    ar: 'شهر',
    en: 'month',
  },
  'subscription.desc.basic': {
    ar: 'مثالي للمبتدئين',
    en: 'Perfect for beginners',
  },
  'subscription.desc.professional': {
    ar: 'للمتداولين الجادين',
    en: 'For serious traders',
  },
  'subscription.desc.enterprise': {
    ar: 'لفرق التداول',
    en: 'For trading teams',
  },
  'subscription.recommended': {
    ar: 'موصى به',
    en: 'Recommended',
  },
  'subscription.selectPlan': {
    ar: 'اختر الخطة',
    en: 'Select Plan',
  },
  'subscription.selected': {
    ar: 'تم الاختيار',
    en: 'Selected',
  },
  'subscription.proceedToPayment': {
    ar: 'المتابعة إلى الدفع',
    en: 'Proceed to Payment',
  },
  'subscription.freeTrial': {
    ar: 'تتضمن جميع الخطط فترة تجريبية مجانية لمدة 7 أيام. لا تحتاج إلى بطاقة ائتمان حتى تنتهي الفترة التجريبية.',
    en: 'All plans include a 7-day free trial. No credit card required until trial ends.',
  },
  'subscription.noPlanSelected': {
    ar: 'لم يتم تحديد خطة',
    en: 'No plan selected',
  },
  'subscription.selectFirst': {
    ar: 'الرجاء تحديد خطة اشتراك أولاً',
    en: 'Please select a subscription plan first',
  },
  'language.toggle': {
    ar: 'تبديل اللغة',
    en: 'Toggle language',
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
