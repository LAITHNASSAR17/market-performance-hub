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
  return;
};
export default LanguageToggle;