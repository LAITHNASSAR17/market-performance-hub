
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import TagList from '@/components/analytics/TagList';
import { CircleX, Target, Lightbulb, ArrowDownRight, CircleCheck, ArrowUpRight, AlertTriangle, Zap, Brain } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Data for analysis
  const mistakeData = [
    { name: 'late entry', impact: -520, occurrences: 3, description: 'Entering a trade after the optimal entry point has passed' },
    { name: 'hesitated', impact: -350, occurrences: 5, description: 'Delayed execution due to uncertainty or fear' }
  ];
  
  const setupData = [
    { name: 'pullback', winRate: 78, occurrences: 9, avgProfit: 245 },
    { name: 'gap and go', winRate: 65, occurrences: 7, avgProfit: 180 }
  ];
  
  const habitData = [
    { name: 'had a game plan', impact: 980, occurrences: 12 },
    { name: 'slept well', impact: 750, occurrences: 8 }
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TagList
          title="Trading Mistakes"
          description="Track errors that cost you money"
          icon={<AlertTriangle className="h-4 w-4" />}
          color="bg-red-500"
          tags={mistakes}
          onAddTag={handleAddMistake}
          onRemoveTag={handleRemoveMistake}
          addButtonLabel="Add Mistake"
        />
        
        <TagList
          title="Trading Setups"
          description="Track your best patterns"
          icon={<Zap className="h-4 w-4" />}
          color="bg-blue-500"
          tags={setups}
          onAddTag={handleAddSetup}
          onRemoveTag={handleRemoveSetup}
          addButtonLabel="Add Setup"
        />
        
        <TagList
          title="Trading Habits"
          description="Track positive behaviors"
          icon={<Brain className="h-4 w-4" />}
          color="bg-purple-500"
          tags={habits}
          onAddTag={handleAddHabit}
          onRemoveTag={handleRemoveHabit}
          addButtonLabel="Add Habit"
        />
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tag Performance Analysis</CardTitle>
            <CardDescription>
              Analyze how different tags affect your trading performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Top Mistakes (by P&L impact)</h3>
                <div className="space-y-2">
                  {mistakeData.map((mistake, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                            <span className="text-sm flex items-center">
                              {mistake.name} 
                              <span className="text-xs text-gray-500 ml-2">({mistake.occurrences} times)</span>
                            </span>
                            <div className="flex items-center text-red-500">
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                              <span>-${Math.abs(mistake.impact).toFixed(2)}</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{mistake.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Best Setups (by win rate)</h3>
                <div className="space-y-2">
                  {setupData.map((setup, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                      <span className="text-sm flex items-center">
                        {setup.name}
                        <span className="text-xs text-gray-500 ml-2">({setup.occurrences} trades)</span>
                      </span>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-green-500">
                          <CircleCheck className="h-4 w-4 mr-1" />
                          <span>{setup.winRate}% win rate</span>
                        </div>
                        <span className="text-xs text-gray-500">Avg: ${setup.avgProfit} per trade</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Positive Habits (by performance)</h3>
                <div className="space-y-2">
                  {habitData.map((habit, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                      <span className="text-sm flex items-center">
                        {habit.name}
                        <span className="text-xs text-gray-500 ml-2">({habit.occurrences} occurrences)</span>
                      </span>
                      <div className="flex items-center text-green-500">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>+${habit.impact.toFixed(2)} avg.</span>
                      </div>
                    </div>
                  ))}
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
