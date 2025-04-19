
import React, { createContext, useContext, useState } from 'react';

interface MenteeViewContextType {
  activeMenteeId: string | null;
  activeMenteeName: string | null;
  enterMenteeView: (menteeId: string, menteeName: string) => void;
  exitMenteeView: () => void;
  isInMenteeView: boolean;
}

const MenteeViewContext = createContext<MenteeViewContextType | undefined>(undefined);

export const MenteeViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenteeId, setActiveMenteeId] = useState<string | null>(null);
  const [activeMenteeName, setActiveMenteeName] = useState<string | null>(null);

  const enterMenteeView = (menteeId: string, menteeName: string) => {
    setActiveMenteeId(menteeId);
    setActiveMenteeName(menteeName);
  };

  const exitMenteeView = () => {
    setActiveMenteeId(null);
    setActiveMenteeName(null);
  };

  return (
    <MenteeViewContext.Provider value={{
      activeMenteeId,
      activeMenteeName,
      enterMenteeView,
      exitMenteeView,
      isInMenteeView: !!activeMenteeId
    }}>
      {children}
    </MenteeViewContext.Provider>
  );
};

export const useMenteeView = () => {
  const context = useContext(MenteeViewContext);
  if (context === undefined) {
    throw new Error('useMenteeView must be used within a MenteeViewProvider');
  }
  return context;
};
