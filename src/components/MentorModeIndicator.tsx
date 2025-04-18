
import React from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { LogOut, Glasses } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MentorModeIndicator: React.FC = () => {
  const { isInMenteeView, exitMenteeView } = useMentor();
  
  if (!isInMenteeView) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center space-x-2 px-4 py-2"
              onClick={() => exitMenteeView()}
            >
              <Glasses className="h-4 w-4" />
              <span>Exit Mentee View</span>
              <LogOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>You are viewing as a mentee. Click to exit.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MentorModeIndicator;
