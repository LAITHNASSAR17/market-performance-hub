
import { useTags } from '@/contexts/TagsContext';

export const useTagsState = () => {
  const tagsContext = useTags();
  
  // Map the context properties to match what AddTrade.tsx expects
  return {
    tags: tagsContext.mistakes.concat(tagsContext.setups).concat(tagsContext.habits),
    addTag: (tag: string) => {
      // Add the tag to the mistakes array as a default behavior
      tagsContext.setMistakes(prev => [...prev, tag]);
    }
  };
};
