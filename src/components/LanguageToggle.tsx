
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className={`${className} flex items-center gap-2`}
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe className="h-5 w-5" />
      <span>
        {language === 'ar' ? 'English' : 'العربية'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
