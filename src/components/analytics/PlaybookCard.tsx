import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Star, Share2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlaybookEntry } from '@/hooks/usePlaybooks';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"

interface PlaybookCardProps {
  playbook: PlaybookEntry;
  onEdit?: (data: Partial<PlaybookEntry>) => void;
  onDelete?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ 
  playbook, 
  onEdit, 
  onDelete,
  onShare,
  onViewDetails 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{playbook.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {playbook.description.length > 100 && !isExpanded
                ? `${playbook.description.substring(0, 100)}...`
                : playbook.description}
              {playbook.description.length > 100 && (
                <Button variant="link" size="sm" onClick={toggleExpanded}>
                  {isExpanded ? "Show Less" : "Show More"}
                </Button>
              )}
            </CardDescription>
            <div className="flex flex-wrap gap-1 mt-2">
              {playbook.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(playbook)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete()}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">Rating</div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span>{playbook.rating || 0}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Win Rate</div>
            <span>{playbook.winRate || 0}%</span>
          </div>
          <div>
            <div className="text-sm font-medium">Profit Factor</div>
            <span>{playbook.profitFactor || 0}</span>
          </div>
          <div>
            <div className="text-sm font-medium">Expected Value</div>
            <span>{playbook.expectedValue || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaybookCard;
