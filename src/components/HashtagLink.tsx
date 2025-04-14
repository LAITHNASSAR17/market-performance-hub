
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToHashtagPage } from '@/utils/hashtagMapping';
import { useToast } from '@/hooks/use-toast';

interface HashtagLinkProps {
  hashtag: string;
  className?: string;
}

const HashtagLink: React.FC<HashtagLinkProps> = ({ hashtag, className = '' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Remove # if present for display
  const displayTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const success = await navigateToHashtagPage(hashtag, navigate);
    
    if (!success) {
      toast({
        title: "Page Not Found",
        description: `No page mapped for ${displayTag}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <span 
      className={`text-blue-500 hover:text-blue-700 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {displayTag}
    </span>
  );
};

export default HashtagLink;
