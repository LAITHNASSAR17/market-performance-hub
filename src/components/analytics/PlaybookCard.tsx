
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, StarHalf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  rating: number;
  tags: string[];
}

interface PlaybookCardProps {
  playbook: PlaybookEntry;
  onSelect: (id: string) => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ playbook, onSelect }) => {
  const { t } = useLanguage();
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-muted-foreground" />);
      }
    }
    
    return stars;
  };
  
  return (
    <Card 
      className="w-full cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => onSelect(playbook.id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{playbook.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{playbook.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          {renderStars(playbook.rating)}
          <span className="ml-2 text-sm">{playbook.rating.toFixed(1)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {playbook.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaybookCard;
