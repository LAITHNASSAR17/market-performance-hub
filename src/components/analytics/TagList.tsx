
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

interface TagListProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

const TagList: React.FC<TagListProps> = ({
  title,
  icon,
  color,
  tags,
  onAddTag,
  onRemoveTag
}) => {
  const [newTag, setNewTag] = useState('');
  const { t } = useLanguage();

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${color}`}>
            {icon}
          </div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="flex items-center gap-1 py-1 px-3"
            >
              {tag}
              <button 
                onClick={() => onRemoveTag(tag)} 
                className="ml-1 hover:text-destructive"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('analytics.noTags') || 'No tags added yet'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            className="flex-1"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('analytics.addTag') || 'Add a new tag...'}
          />
          <Button size="sm" variant="outline" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagList;
