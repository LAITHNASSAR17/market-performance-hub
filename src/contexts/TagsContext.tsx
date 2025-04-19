
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

interface TagsContextType {
  mistakes: string[];
  setMistakes: React.Dispatch<React.SetStateAction<string[]>>;
  setups: string[];
  setSetups: React.Dispatch<React.SetStateAction<string[]>>;
  habits: string[];
  setHabits: React.Dispatch<React.SetStateAction<string[]>>;
  tradingDays: {day: string, performance: number}[];
  setTradingDays: React.Dispatch<React.SetStateAction<{day: string, performance: number}[]>>;
  isLoading: boolean;
  tags: string[]; // Add tags property
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export function TagsProvider({ children }: { children: React.ReactNode }) {
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
  const [isLoading, setIsLoading] = useState(true);
  // Add tags state
  const [tags, setTags] = useState<string[]>([...mistakes, ...setups, ...habits]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load tags from database or local storage
  useEffect(() => {
    const loadTags = async () => {
      try {
        // Combine all tag types for the tags array
        setTags([...mistakes, ...setups, ...habits]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading tags:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tags',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    loadTags();
  }, [mistakes, setups, habits, user]);

  return (
    <TagsContext.Provider value={{ 
      mistakes, 
      setMistakes, 
      setups, 
      setSetups, 
      habits, 
      setHabits, 
      tradingDays, 
      setTradingDays,
      isLoading,
      tags
    }}>
      {children}
    </TagsContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
}
