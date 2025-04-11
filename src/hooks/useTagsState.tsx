
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useTagsState = () => {
  const [mistakes, setMistakes] = useState<string[]>(['late entry', 'hesitated', 'left profits on the table', 'poor risk management', 'traded without plan', 'revenge trading']);
  const [setups, setSetups] = useState<string[]>(['gap and go', 'pullback', 'breakout', 'reversal', 'consolidation', 'trend continuation']);
  const [habits, setHabits] = useState<string[]>(['had a game plan', 'slept well', 'morning routine', 'followed rules', 'proper position sizing', 'respected risk management']);
  const [tradingDays, setTradingDays] = useState<{day: string, performance: number}[]>([
    {day: 'Monday', performance: 450},
    {day: 'Tuesday', performance: -120},
    {day: 'Wednesday', performance: 380},
    {day: 'Thursday', performance: 650},
    {day: 'Friday', performance: -240}
  ]);
  
  return {
    mistakes,
    setMistakes,
    setups,
    setSetups,
    habits,
    setHabits,
    tradingDays,
    setTradingDays
  };
};
