
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface LanguageToggleProps {
  variant?: 'icon' | 'switch';
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  variant = 'icon',
  className = '' 
}) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs">EN</span>
        <Switch 
          checked={language === 'ar'} 
          onCheckedChange={toggleLanguage} 
          aria-label={t('language.toggle') || 'Toggle language'}
        />
        <span className="text-xs">العربية</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className={`${className} flex items-center gap-2`}
        >
          <Globe className="h-5 w-5" />
          <span className="hidden sm:inline">
            {language === 'ar' ? 'English' : 'العربية'}
          </span>
          <span className="sr-only">{t('language.toggle') || 'Toggle language'}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
        {language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      </TooltipContent>
    </Tooltip>
  );
};

export default LanguageToggle;
