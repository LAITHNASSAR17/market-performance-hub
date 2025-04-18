
import { useTagsState } from './useTagsState';

export const useTradeTags = () => {
  const { mistakes, setups, habits } = useTagsState();
  
  const allTradeTags = {
    mistakes: {
      title: 'Mistakes',
      tags: mistakes,
      color: 'text-red-500'
    },
    setups: {
      title: 'Setups',
      tags: setups,
      color: 'text-blue-500'
    },
    habits: {
      title: 'Habits',
      tags: habits,
      color: 'text-purple-500'
    }
  };

  return {
    allTradeTags
  };
};
