
import { supabase } from '@/lib/supabase';

export interface IMentorship {
  id: string;
  mentorId: string;
  menteeId: string | null;
  inviteEmail: string | null;
  inviteCode: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentorNote {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  content: string;
  folder: string | null;
  templateId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenteeWithStats {
  id: string;
  name: string;
  email: string;
  mentorshipId: string;
  status: 'pending' | 'accepted' | 'rejected';
  netProfitLoss: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
}

export const mentorService = {
  async getMentorships(mentorId: string): Promise<IMentorship[]> {
    const { data, error } = await supabase
      .from('mentorships')
      .select('*')
      .eq('mentor_id', mentorId);

    if (error) {
      console.error('Error fetching mentorships:', error);
      return [];
    }

    return data.map(formatMentorship);
  },

  async createMentorship(mentorId: string, email: string): Promise<IMentorship | null> {
    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substring(2, 10);

    const { data, error } = await supabase
      .from('mentorships')
      .insert({
        mentor_id: mentorId,
        invite_email: email,
        invite_code: inviteCode,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mentorship:', error);
      return null;
    }

    return formatMentorship(data);
  },

  async acceptMentorshipInvite(inviteCode: string, menteeId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('mentorships')
      .update({
        mentee_id: menteeId,
        status: 'accepted'
      })
      .eq('invite_code', inviteCode)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Error accepting mentorship invite:', error);
      return false;
    }

    return true;
  },

  async cancelMentorship(mentorshipId: string): Promise<boolean> {
    const { error } = await supabase
      .from('mentorships')
      .delete()
      .eq('id', mentorshipId);

    if (error) {
      console.error('Error canceling mentorship:', error);
      return false;
    }

    return true;
  },

  async getMenteeProfile(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching mentee profile:', error);
      return null;
    }

    return data;
  },

  async getMenteesWithStats(mentorId: string): Promise<IMenteeWithStats[]> {
    // First get all accepted mentorships
    const { data: mentorships, error: mentorshipsError } = await supabase
      .from('mentorships')
      .select('id, mentee_id, status, invite_email')
      .eq('mentor_id', mentorId);

    if (mentorshipsError) {
      console.error('Error fetching mentorships:', mentorshipsError);
      return [];
    }

    // For each mentee, get their profile and stats
    const mentees: IMenteeWithStats[] = [];

    for (const mentorship of mentorships) {
      if (mentorship.mentee_id) {
        // Get mentee profile
        const menteeProfile = await this.getMenteeProfile(mentorship.mentee_id);
        
        if (!menteeProfile) continue;

        // Get mentee trades
        const { data: trades, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', mentorship.mentee_id);

        if (tradesError) {
          console.error('Error fetching mentee trades:', tradesError);
          continue;
        }

        // Calculate stats
        const netProfitLoss = trades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
        const winningTrades = trades.filter(trade => trade.profit_loss > 0);
        const losingTrades = trades.filter(trade => trade.profit_loss < 0);
        const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
        const avgWin = winningTrades.length > 0 
          ? winningTrades.reduce((sum, trade) => sum + trade.profit_loss, 0) / winningTrades.length 
          : 0;
        const avgLoss = losingTrades.length > 0 
          ? losingTrades.reduce((sum, trade) => sum + trade.profit_loss, 0) / losingTrades.length 
          : 0;

        mentees.push({
          id: menteeProfile.id,
          name: menteeProfile.name,
          email: menteeProfile.email,
          mentorshipId: mentorship.id,
          status: mentorship.status,
          netProfitLoss,
          winRate,
          avgWin,
          avgLoss,
          totalTrades: trades.length
        });
      } else if (mentorship.invite_email) {
        // Pending invite
        mentees.push({
          id: '',
          name: 'Pending Invite',
          email: mentorship.invite_email,
          mentorshipId: mentorship.id,
          status: mentorship.status,
          netProfitLoss: 0,
          winRate: 0,
          avgWin: 0,
          avgLoss: 0,
          totalTrades: 0
        });
      }
    }

    return mentees;
  },

  async createMentorNote(note: Omit<IMentorNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<IMentorNote | null> {
    const { data, error } = await supabase
      .from('mentor_notes')
      .insert({
        mentor_id: note.mentorId,
        mentee_id: note.menteeId,
        title: note.title,
        content: note.content,
        folder: note.folder,
        template_id: note.templateId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mentor note:', error);
      return null;
    }

    return formatMentorNote(data);
  },

  async getMentorNotes(mentorId: string, menteeId: string): Promise<IMentorNote[]> {
    const { data, error } = await supabase
      .from('mentor_notes')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('mentee_id', menteeId);

    if (error) {
      console.error('Error fetching mentor notes:', error);
      return [];
    }

    return data.map(formatMentorNote);
  },

  async switchToMenteeView(menteeId: string): Promise<boolean> {
    // We'll use localStorage to track the current mentor mode
    localStorage.setItem('current_mentee_id', menteeId);
    return true;
  },

  async exitMenteeView(): Promise<boolean> {
    localStorage.removeItem('current_mentee_id');
    return true;
  },

  isInMenteeView(): boolean {
    return !!localStorage.getItem('current_mentee_id');
  },

  getCurrentMenteeId(): string | null {
    return localStorage.getItem('current_mentee_id');
  }
};

function formatMentorship(data: any): IMentorship {
  return {
    id: data.id,
    mentorId: data.mentor_id,
    menteeId: data.mentee_id,
    inviteEmail: data.invite_email,
    inviteCode: data.invite_code,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

function formatMentorNote(data: any): IMentorNote {
  return {
    id: data.id,
    mentorId: data.mentor_id,
    menteeId: data.mentee_id,
    title: data.title,
    content: data.content,
    folder: data.folder,
    templateId: data.template_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
