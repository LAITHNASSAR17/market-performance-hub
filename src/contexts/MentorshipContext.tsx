
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mentorshipService, IMentorship } from '@/services/mentorshipService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface MentorshipContextType {
  mentorships: IMentorship[];
  isLoading: boolean;
  createInvite: (email: string) => Promise<void>;
  generateLink: () => Promise<string>;
  acceptInvite: (id: string) => Promise<void>;
  rejectInvite: (id: string) => Promise<void>;
  deleteMentorship: (id: string) => Promise<void>;
  refreshMentorships: () => Promise<void>;
  isMentor: boolean;
  isMentee: boolean;
  getMenteesByMentor: (mentorId: string) => IMentorship[];
  getMentorsByMentee: (menteeId: string) => IMentorship[];
}

const MentorshipContext = createContext<MentorshipContextType | undefined>(undefined);

export const MentorshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mentorships, setMentorships] = useState<IMentorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log("MentorshipContext: Current user", user); // Debug log
  console.log("MentorshipContext: Current mentorships", mentorships); // Debug log

  const refreshMentorships = async () => {
    if (!user) {
      console.log("MentorshipContext: No user, skipping refresh"); // Debug log
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("MentorshipContext: Refreshing mentorships for user", user.id); // Debug log
      const data = await mentorshipService.getMentorshipsByUser();
      console.log("MentorshipContext: Received mentorships", data); // Debug log
      setMentorships(data);
    } catch (error: any) {
      console.error("MentorshipContext: Error refreshing mentorships", error); // Debug log
      toast({
        title: "Error loading mentorships",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("MentorshipContext: useEffect triggered, user:", user); // Debug log
    if (user) {
      refreshMentorships();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const createInvite = async (email: string) => {
    try {
      await mentorshipService.createMentorshipInvite(email);
      await refreshMentorships();
      toast({
        title: "Invitation sent",
        description: "Mentorship invitation has been sent successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateLink = async () => {
    try {
      const mentorship = await mentorshipService.generateInviteLink();
      await refreshMentorships();
      return mentorship.invite_code || '';
    } catch (error: any) {
      toast({
        title: "Error generating link",
        description: error.message,
        variant: "destructive"
      });
      return '';
    }
  };

  const acceptInvite = async (id: string) => {
    try {
      await mentorshipService.acceptInvitation(id);
      await refreshMentorships();
      toast({
        title: "Invitation accepted",
        description: "You have successfully accepted the mentorship invitation"
      });
    } catch (error: any) {
      toast({
        title: "Error accepting invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const rejectInvite = async (id: string) => {
    try {
      await mentorshipService.rejectInvitation(id);
      await refreshMentorships();
      toast({
        title: "Invitation rejected",
        description: "You have rejected the mentorship invitation"
      });
    } catch (error: any) {
      toast({
        title: "Error rejecting invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteMentorship = async (id: string) => {
    try {
      await mentorshipService.deleteMentorship(id);
      await refreshMentorships();
      toast({
        title: "Mentorship deleted",
        description: "The mentorship has been successfully deleted"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting mentorship",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // New helper methods for the mentor dashboard
  const getMenteesByMentor = (mentorId: string) => {
    return mentorships.filter(m => m.mentor_id === mentorId);
  };

  const getMentorsByMentee = (menteeId: string) => {
    return mentorships.filter(m => m.mentee_id === menteeId);
  };

  const isMentor = user ? mentorships.some(m => m.mentor_id === user.id && m.status === 'accepted') : false;
  const isMentee = user ? mentorships.some(m => m.mentee_id === user.id && m.status === 'accepted') : false;

  console.log("MentorshipContext: isMentor =", isMentor); // Debug log
  console.log("MentorshipContext: isMentee =", isMentee); // Debug log

  return (
    <MentorshipContext.Provider value={{
      mentorships,
      isLoading,
      createInvite,
      generateLink,
      acceptInvite,
      rejectInvite,
      deleteMentorship,
      refreshMentorships,
      isMentor,
      isMentee,
      getMenteesByMentor,
      getMentorsByMentee
    }}>
      {children}
    </MentorshipContext.Provider>
  );
};

export const useMentorship = () => {
  const context = useContext(MentorshipContext);
  if (context === undefined) {
    throw new Error('useMentorship must be used within a MentorshipProvider');
  }
  return context;
};
