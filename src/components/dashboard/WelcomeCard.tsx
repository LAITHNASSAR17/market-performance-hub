
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WelcomeCardProps {
  name: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  className?: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  name,
  message,
  buttonText,
  onButtonClick,
  className
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700",
      className
    )}>
      <div className="flex flex-col md:flex-row p-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-1">
            Congratulations {name}! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {message}
          </p>
          <Button 
            variant="outline" 
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30 dark:hover:bg-purple-900/30"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
        <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4">
          <img 
            src="/lovable-uploads/93065954-ac00-4826-91a1-d5443452b53a.png" 
            alt="Dashboard illustration" 
            className="h-24 md:h-32 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
