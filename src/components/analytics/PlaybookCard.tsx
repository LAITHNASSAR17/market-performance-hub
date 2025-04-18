
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Star, TrendingUp, Percent, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlaybookEntry } from '@/hooks/usePlaybooks';

interface PlaybookCardProps {
  playbook: PlaybookEntry;
  onEdit?: (updatedData: Partial<PlaybookEntry>) => void;
  onDelete?: () => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ playbook, onEdit, onDelete }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{playbook.name}</CardTitle>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-4 w-4 ${
                  star <= Math.round(playbook.rating) 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-muted-foreground"
                }`}
                onClick={() => onEdit && onEdit({ rating: star })}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{playbook.description}</p>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {t('analytics.rMultiple') || 'R-Multiple'}
            </div>
            <div className="text-lg font-semibold">{playbook.rMultiple || 0}R</div>
          </div>
          
          <div className="flex flex-col items-center p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Percent className="h-3 w-3 mr-1" />
              {t('analytics.winRate') || 'Win Rate'}
            </div>
            <div className="text-lg font-semibold">{playbook.winRate || 0}%</div>
          </div>
          
          <div className="flex flex-col items-center p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <ArrowRightLeft className="h-3 w-3 mr-1" />
              {t('analytics.ev') || 'Exp. Value'}
            </div>
            <div className={`text-lg font-semibold ${
              (playbook.expectedValue || 0) > 0 ? 'text-green-500' : 
              (playbook.expectedValue || 0) < 0 ? 'text-red-500' : ''
            }`}>
              {playbook.expectedValue || 0}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {playbook.tags.map((tag, i) => (
            <Badge key={i} variant="outline">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-end gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit({})}>
            <Pencil className="h-3 w-3 mr-1" />
            {t('edit') || 'Edit'}
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3 mr-1" />
            {t('delete') || 'Delete'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlaybookCard;
