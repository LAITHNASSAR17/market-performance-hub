
import React, { createContext, useContext, useState } from 'react';
import { TradingContextCommon } from '@/types/tradingTypes';

// Default hashtags
const defaultHashtags = [
  'setup', 'momentum', 'breakout', 'retracement', 'technical', 'fundamental', 
  'news', 'mistake', 'perfecttrade', 'patience', 'fakeout'
];

interface HashtagsContextType extends TradingContextCommon {
  allHashtags: string[];
  addHashtag: (hashtag: string) => void;
}

const HashtagsContext = createContext<HashtagsContextType | undefined>(undefined);

export const HashtagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allHashtags, setAllHashtags] = useState<string[]>(defaultHashtags);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Add a new hashtag if it doesn't exist yet
  const addHashtag = (hashtag: string) => {
    if (!allHashtags.includes(hashtag)) {
      setAllHashtags(prevHashtags => [...prevHashtags, hashtag]);
    }
  };

  return (
    <HashtagsContext.Provider value={{ 
      allHashtags,
      addHashtag,
      loading,
      error
    }}>
      {children}
    </HashtagsContext.Provider>
  );
};

export const useHashtags = () => {
  const context = useContext(HashtagsContext);
  if (context === undefined) {
    throw new Error('useHashtags must be used within a HashtagsProvider');
  }
  return context;
};
