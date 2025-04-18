
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagSelectorsProps {
  mistakes: string[];
  setups: string[];
  habits: string[];
  selectedMistakes: string[];
  selectedSetups: string[];
  selectedHabits: string[];
  onAddMistake: (tag: string) => void;
  onAddSetup: (tag: string) => void;
  onAddHabit: (tag: string) => void;
  onRemoveMistake: (tag: string) => void;
  onRemoveSetup: (tag: string) => void;
  onRemoveHabit: (tag: string) => void;
}

const TagSelectors: React.FC<TagSelectorsProps> = ({
  mistakes,
  setups,
  habits,
  selectedMistakes,
  selectedSetups,
  selectedHabits,
  onAddMistake,
  onAddSetup,
  onAddHabit,
  onRemoveMistake,
  onRemoveSetup,
  onRemoveHabit,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h3 className="font-medium">Trading Mistakes</h3>
        </div>
        <Select onValueChange={onAddMistake}>
          <SelectTrigger>
            <SelectValue placeholder="Select a mistake tag" />
          </SelectTrigger>
          <SelectContent>
            {mistakes.filter(tag => !selectedMistakes.includes(tag)).map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedMistakes.map(tag => (
            <Badge key={tag} variant="destructive" className="flex items-center gap-1">
              {tag}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-transparent" 
                onClick={() => onRemoveMistake(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <h3 className="font-medium">Trading Setups</h3>
        </div>
        <Select onValueChange={onAddSetup}>
          <SelectTrigger>
            <SelectValue placeholder="Select a setup tag" />
          </SelectTrigger>
          <SelectContent>
            {setups.filter(tag => !selectedSetups.includes(tag)).map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSetups.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-transparent" 
                onClick={() => onRemoveSetup(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <h3 className="font-medium">Trading Habits</h3>
        </div>
        <Select onValueChange={onAddHabit}>
          <SelectTrigger>
            <SelectValue placeholder="Select a habit tag" />
          </SelectTrigger>
          <SelectContent>
            {habits.filter(tag => !selectedHabits.includes(tag)).map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedHabits.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-purple-100">
              {tag}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-transparent" 
                onClick={() => onRemoveHabit(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagSelectors;
