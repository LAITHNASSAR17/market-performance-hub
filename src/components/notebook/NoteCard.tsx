
import React from 'react';
import { Star, StarOff, FileText, Calendar, Tag, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { INote } from '@/services/noteService';

interface NoteCardProps {
  note: INote;
  onSelect: (note: INote) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onSelect, 
  onToggleFavorite, 
  onDelete 
}) => {
  const { id, title, content, isFavorite, tags, createdAt, updatedAt } = note;
  
  const formattedDate = new Date(updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Extract plain text preview from content
  const getPreview = () => {
    // Remove markdown formatting for preview
    const plainText = content
      .replace(/#{1,6}\s?([^\n]+)/g, '$1') // Remove headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/- \[ \]/g, '☐') // Convert checkboxes
      .replace(/- \[x\]/g, '☑'); // Convert checked checkboxes
    
    return plainText.length > 150 
      ? plainText.substring(0, 147) + '...' 
      : plainText;
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id, !isFavorite);
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors h-full flex flex-col"
      onClick={() => onSelect(note)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
          <div className="flex">
            <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
              {isFavorite ? (
                <Star className="h-4 w-4 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onSelect(note);
                }}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(id, !isFavorite);
                }}>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  Move to trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-sm text-muted-foreground line-clamp-4 mb-2">
          {getPreview()}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-1 pb-3">
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formattedDate}</span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
