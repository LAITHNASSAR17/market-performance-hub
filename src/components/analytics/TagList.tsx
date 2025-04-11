
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TagListProps {
  title: string;
  icon?: React.ReactNode;
  color?: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

const TagList: React.FC<TagListProps> = ({
  title,
  icon,
  color = 'bg-blue-500',
  tags,
  onAddTag,
  onRemoveTag
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
    <Card>
      <CardHeader className={`pb-2 ${color} text-white rounded-t-lg`}>
        <CardTitle className="text-lg flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex mb-3">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('analytics.addNewTag') || "Add new tag..."}
            className="flex-1 mr-2"
          />
          <Button onClick={handleAddTag} disabled={!newTag.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag, i) => (
            <Badge key={i} className="py-1 px-2 flex items-center gap-1">
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 rounded-full hover:bg-gray-700 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {tags.length === 0 && (
            <div className="text-sm text-muted-foreground">
              {t('analytics.noTags') || 'No tags yet. Add your first tag!'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagList;
