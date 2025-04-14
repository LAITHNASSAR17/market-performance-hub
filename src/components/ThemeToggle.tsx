
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface ThemeToggleProps {
  variant?: 'icon' | 'switch';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon', 
  className = '' 
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  
  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Sun className="h-4 w-4 text-amber-500" />
        <Switch 
          checked={theme === 'dark'} 
          onCheckedChange={toggleTheme} 
          aria-label={t('theme.toggle') || 'Toggle theme'}
        />
        <Moon className="h-4 w-4 text-indigo-400" />
      </div>
    );
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className={className}
          aria-label={t('theme.toggle') || 'Toggle theme'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-300" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600" />
          )}
          <span className="sr-only">{t('theme.toggle') || 'Toggle theme'}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {theme === 'dark' 
          ? (t('theme.lightMode') || 'Light mode') 
          : (t('theme.darkMode') || 'Dark mode')}
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
