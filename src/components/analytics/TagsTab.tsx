
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TagList from '@/components/analytics/TagList';
import { CircleX, Target, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TagsTabProps {
  mistakes: string[];
  setMistakes: React.Dispatch<React.SetStateAction<string[]>>;
  setups: string[];
  setSetups: React.Dispatch<React.SetStateAction<string[]>>;
  habits: string[];
  setHabits: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagsTab: React.FC<TagsTabProps> = ({
  mistakes,
  setMistakes,
  setups,
  setSetups,
  habits,
  setHabits
}) => {
  const { t } = useLanguage();
  
  // Create wrapper functions to handle adding tags
  const handleAddMistake = (tag: string) => {
    setMistakes(prev => [...prev, tag]);
  };
  
  const handleAddSetup = (tag: string) => {
    setSetups(prev => [...prev, tag]);
  };
  
  const handleAddHabit = (tag: string) => {
    setHabits(prev => [...prev, tag]);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TagList
        title={t('analytics.mistakes') || 'Mistakes'}
        icon={<CircleX className="h-4 w-4" />}
        color="bg-red-500"
        tags={mistakes}
        onAddTag={handleAddMistake}
        onRemoveTag={(tag) => setMistakes(mistakes.filter(t => t !== tag))}
      />
      
      <TagList
        title={t('analytics.setups') || 'Setups'}
        icon={<Target className="h-4 w-4" />}
        color="bg-blue-500"
        tags={setups}
        onAddTag={handleAddSetup}
        onRemoveTag={(tag) => setSetups(setups.filter(t => t !== tag))}
      />
      
      <TagList
        title={t('analytics.habits') || 'Habits'}
        icon={<Lightbulb className="h-4 w-4" />}
        color="bg-purple-500"
        tags={habits}
        onAddTag={handleAddHabit}
        onRemoveTag={(tag) => setHabits(habits.filter(t => t !== tag))}
      />
    </div>
  );
};

export default TagsTab;
