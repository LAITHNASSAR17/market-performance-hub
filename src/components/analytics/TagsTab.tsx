
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import TagList from '@/components/analytics/TagList';
import { CircleX, Target, Lightbulb, ArrowDownRight, CircleCheck, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  
  const handleAddMistake = (tag: string) => {
    if (!mistakes.includes(tag)) {
      setMistakes([...mistakes, tag]);
      toast({
        title: "Mistake added",
        description: `"${tag}" has been added to your mistakes list.`
      });
    }
  };
  
  const handleRemoveMistake = (tag: string) => {
    setMistakes(mistakes.filter(t => t !== tag));
  };
  
  const handleAddSetup = (tag: string) => {
    if (!setups.includes(tag)) {
      setSetups([...setups, tag]);
      toast({
        title: "Setup added",
        description: `"${tag}" has been added to your setups list.`
      });
    }
  };
  
  const handleRemoveSetup = (tag: string) => {
    setSetups(setups.filter(t => t !== tag));
  };
  
  const handleAddHabit = (tag: string) => {
    if (!habits.includes(tag)) {
      setHabits([...habits, tag]);
      toast({
        title: "Habit added",
        description: `"${tag}" has been added to your habits list.`
      });
    }
  };
  
  const handleRemoveHabit = (tag: string) => {
    setHabits(habits.filter(t => t !== tag));
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TagList
          title={t('analytics.mistakes') || 'Mistakes'}
          icon={<CircleX className="h-4 w-4" />}
          color="bg-red-500"
          tags={mistakes}
          onAddTag={handleAddMistake}
          onRemoveTag={handleRemoveMistake}
        />
        
        <TagList
          title={t('analytics.setups') || 'Setups'}
          icon={<Target className="h-4 w-4" />}
          color="bg-blue-500"
          tags={setups}
          onAddTag={handleAddSetup}
          onRemoveTag={handleRemoveSetup}
        />
        
        <TagList
          title={t('analytics.habits') || 'Habits'}
          icon={<Lightbulb className="h-4 w-4" />}
          color="bg-purple-500"
          tags={habits}
          onAddTag={handleAddHabit}
          onRemoveTag={handleRemoveHabit}
        />
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.tagTrend') || 'Tag Trends'}</CardTitle>
            <CardDescription>
              {t('analytics.tagTrendDesc') || 'Analyze how different tags affect your trading performance'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">{t('analytics.topMistakes') || 'Top Mistakes (by P&L impact)'}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">late entry</span>
                    <div className="flex items-center text-red-500">
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      <span>-$520.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">hesitated</span>
                    <div className="flex items-center text-red-500">
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      <span>-$350.00</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">{t('analytics.bestSetups') || 'Best Setups (by win rate)'}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">pullback</span>
                    <div className="flex items-center text-green-500">
                      <CircleCheck className="h-4 w-4 mr-1" />
                      <span>78% win rate</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">gap and go</span>
                    <div className="flex items-center text-green-500">
                      <CircleCheck className="h-4 w-4 mr-1" />
                      <span>65% win rate</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">{t('analytics.positiveHabits') || 'Positive Habits (by performance)'}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">had a game plan</span>
                    <div className="flex items-center text-green-500">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+$980.00 avg.</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">slept well</span>
                    <div className="flex items-center text-green-500">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+$750.00 avg.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TagsTab;
