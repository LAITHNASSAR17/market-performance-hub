
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC<{
  className?: string;
}> = ({
  className
}) => {
  const {
    language,
    setLanguage
  } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={toggleLanguage}
    >
      <Globe className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
      {language === 'ar' ? 'English' : 'العربية'}
    </Button>
  );
};

export default LanguageToggle;
