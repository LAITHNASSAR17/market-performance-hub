
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const MentorInviteBanner: React.FC = () => {
  const [hasPendingInvites, setHasPendingInvites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mentorName, setMentorName] = useState('');
  const [mentorshipId, setMentorshipId] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkForInvites = async () => {
      if (!user) return;
      
      try {
        // Check for pending invites by email (user hasn't accepted yet)
        const { data, error } = await supabase
          .from('mentorships')
          .select('*, users!mentorships_mentor_id_fkey(name)')
          .eq('invite_email', user.email)
          .eq('status', 'pending')
          .is('mentee_id', null)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking for mentor invites:', error);
          return;
        }
        
        if (data) {
          setHasPendingInvites(true);
          setMentorName(data.users.name);
          setMentorshipId(data.id);
        }
      } catch (error) {
        console.error('Error checking for mentor invites:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkForInvites();
  }, [user]);

  const handleAccept = async () => {
    if (!user || !mentorshipId) return;
    
    try {
      const { error } = await supabase
        .from('mentorships')
        .update({
          mentee_id: user.id,
          status: 'accepted'
        })
        .eq('id', mentorshipId);
      
      if (error) throw error;
      
      toast({
        title: 'Invitation Accepted',
        description: `You are now being mentored by ${mentorName}`,
      });
      
      setHasPendingInvites(false);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept invitation',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async () => {
    if (!mentorshipId) return;
    
    try {
      const { error } = await supabase
        .from('mentorships')
        .delete()
        .eq('id', mentorshipId);
      
      if (error) throw error;
      
      toast({
        title: 'Invitation Rejected',
        description: 'The mentorship invitation has been rejected',
      });
      
      setHasPendingInvites(false);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject invitation',
        variant: 'destructive'
      });
    }
  };

  if (loading || !hasPendingInvites) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start justify-between">
      <div className="flex items-start">
        <AlertCircle className="text-purple-600 mt-0.5 h-5 w-5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-purple-900">Mentorship Invitation</h3>
          <p className="text-purple-700 text-sm mt-1">
            {mentorName} has invited you to join their mentorship program. Accept to give them access to your trading data and receive coaching.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <Button
          size="sm"
          variant="outline"
          className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
          onClick={handleReject}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Decline
        </Button>
        <Button
          size="sm"
          onClick={handleAccept}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Accept
        </Button>
      </div>
    </div>
  );
};

export default MentorInviteBanner;
