
import { useNavigate } from 'react-router-dom';
import { useMenteeView } from '@/contexts/MenteeViewContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const MenteeViewBanner = () => {
  const { activeMenteeName, exitMenteeView } = useMenteeView();
  const navigate = useNavigate();

  if (!activeMenteeName) return null;

  const handleExit = () => {
    exitMenteeView();
    navigate('/mentor-dashboard');
  };

  return (
    <div className="bg-blue-500/10 border-b py-2">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">Viewing account: </span>
          <span className="font-medium">{activeMenteeName}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleExit}>
          <LogOut className="mr-2 h-4 w-4" />
          Exit View
        </Button>
      </div>
    </div>
  );
};
