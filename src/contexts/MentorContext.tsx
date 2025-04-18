
import React, { createContext, useContext, useState, useEffect } from 'react';
import { IMentorship, IMenteeWithStats, mentorService } from '@/services/mentorService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface MentorContextType {
  mentorships: IMentorship[];
  mentees: IMenteeWithStats[];
  loading: boolean;
  currentMenteeId: string | null;
  isInMenteeView: boolean;
  refreshMentorships: () => Promise<void>;
  inviteMentee: (email: string) => Promise<boolean>;
  cancelMentorship: (mentorshipId: string) => Promise<boolean>;
  switchToMenteeView: (menteeId: string) => Promise<void>;
  exitMenteeView: () => Promise<void>;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mentorships, setMentorships] = useState<IMentorship[]>([]);
  const [mentees, setMentees] = useState<IMenteeWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMenteeId, setCurrentMenteeId] = useState<string | null>(null);
  const [isInMenteeView, setIsInMenteeView] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're in mentee view
    const savedMenteeId = mentorService.getCurrentMenteeId();
    if (savedMenteeId) {
      setCurrentMenteeId(savedMenteeId);
      setIsInMenteeView(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshMentorships();
    }
  }, [user]);

  const refreshMentorships = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const fetchedMentorships = await mentorService.getMentorships(user.id);
      setMentorships(fetchedMentorships);
      
      const fetchedMentees = await mentorService.getMenteesWithStats(user.id);
      setMentees(fetchedMentees);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      toast({
        title: "Error",
        description: "Failed to load mentorship data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteMentee = async (email: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const mentorship = await mentorService.createMentorship(user.id, email);
      if (mentorship) {
        await refreshMentorships();
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${email}`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error inviting mentee:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelMentorship = async (mentorshipId: string): Promise<boolean> => {
    try {
      const success = await mentorService.cancelMentorship(mentorshipId);
      if (success) {
        await refreshMentorships();
        toast({
          title: "Mentorship Cancelled",
          description: "The mentorship has been cancelled",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling mentorship:', error);
      toast({
        title: "Error",
        description: "Failed to cancel mentorship",
        variant: "destructive"
      });
      return false;
    }
  };

  const switchToMenteeView = async (menteeId: string): Promise<void> => {
    try {
      await mentorService.switchToMenteeView(menteeId);
      setCurrentMenteeId(menteeId);
      setIsInMenteeView(true);
      
      toast({
        title: "Mentee View Activated",
        description: "You are now viewing as a mentee",
      });
    } catch (error) {
      console.error('Error switching to mentee view:', error);
      toast({
        title: "Error",
        description: "Failed to switch to mentee view",
        variant: "destructive"
      });
    }
  };

  const exitMenteeView = async (): Promise<void> => {
    try {
      await mentorService.exitMenteeView();
      setCurrentMenteeId(null);
      setIsInMenteeView(false);
      
      toast({
        title: "Exited Mentee View",
        description: "You are now back to your own account",
      });
    } catch (error) {
      console.error('Error exiting mentee view:', error);
      toast({
        title: "Error",
        description: "Failed to exit mentee view",
        variant: "destructive"
      });
    }
  };

  const value = {
    mentorships,
    mentees,
    loading,
    currentMenteeId,
    isInMenteeView,
    refreshMentorships,
    inviteMentee,
    cancelMentorship,
    switchToMenteeView,
    exitMenteeView
  };

  return (
    <MentorContext.Provider value={value}>
      {children}
    </MentorContext.Provider>
  );
};

export const useMentor = () => {
  const context = useContext(MentorContext);
  if (context === undefined) {
    throw new Error('useMentor must be used within a MentorProvider');
  }
  return context;
};
