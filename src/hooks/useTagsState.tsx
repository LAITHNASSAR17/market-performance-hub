
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useTagsState = () => {
  const [mistakes, setMistakes] = useState<string[]>(['late entry', 'hesitated', 'left profits on the table']);
  const [setups, setSetups] = useState<string[]>(['gap and go', 'pullback', 'breakout']);
  const [habits, setHabits] = useState<string[]>(['had a game plan', 'slept well', 'morning routine']);
  
  return {
    mistakes,
    setMistakes,
    setups,
    setSetups,
    habits,
    setHabits
  };
};
