
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TagListProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  addButtonLabel?: string;
}

const TagList: React.FC<TagListProps> = ({
  title,
  description,
  icon,
  color = 'bg-blue-500',
  tags,
  onAddTag,
  onRemoveTag,
  addButtonLabel = "Add Tag"
}) => {
  const { t } = useLanguage();
  const [newTag, setNewTag] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className={`pb-2 ${color} text-white rounded-t-lg`}>
        <CardTitle className="text-lg flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-white/80">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        <div className="flex mb-3">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add new tag..."
            className="flex-1 mr-2"
          />
          <Button onClick={handleAddTag} disabled={!newTag.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{addButtonLabel}</span>
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 flex-1">
          {tags.map((tag, i) => (
            <Badge 
              key={i} 
              className="py-1.5 px-3 flex items-center gap-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              variant="outline"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 p-0.5"
                aria-label="Remove tag"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {tags.length === 0 && (
            <div className="text-sm text-muted-foreground w-full text-center py-4">
              No tags yet. Add your first tag!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagList;
