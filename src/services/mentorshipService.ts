
import { supabase } from '@/lib/supabase';

export interface IMentorship {
  id: string;
  mentor_id: string;
  mentee_id: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  invite_code: string | null;
  invite_email: string | null;
  created_at: Date;
  updated_at: Date;
}

export const mentorshipService = {
  async createMentorshipInvite(menteeEmail: string): Promise<IMentorship> {
    const { data, error } = await supabase
      .from('mentorships')
      .insert({
        mentor_id: (await supabase.auth.getUser()).data.user?.id,
        invite_email: menteeEmail,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async generateInviteLink(): Promise<IMentorship> {
    const inviteCode = Math.random().toString(36).substring(2, 15);
    const { data, error } = await supabase
      .from('mentorships')
      .insert({
        mentor_id: (await supabase.auth.getUser()).data.user?.id,
        invite_code: inviteCode,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async acceptInvitation(mentorshipId: string): Promise<IMentorship> {
    const { data, error } = await supabase
      .from('mentorships')
      .update({
        mentee_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'accepted'
      })
      .eq('id', mentorshipId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async rejectInvitation(mentorshipId: string): Promise<void> {
    const { error } = await supabase
      .from('mentorships')
      .update({
        status: 'rejected'
      })
      .eq('id', mentorshipId);
    
    if (error) throw error;
  },

  async getMentorshipsByUser(): Promise<IMentorship[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data, error } = await supabase
      .from('mentorships')
      .select('*')
      .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`);
    
    if (error) throw error;
    return data || [];
  },

  async deleteMentorship(mentorshipId: string): Promise<void> {
    const { error } = await supabase
      .from('mentorships')
      .delete()
      .eq('id', mentorshipId);
    
    if (error) throw error;
  }
};
