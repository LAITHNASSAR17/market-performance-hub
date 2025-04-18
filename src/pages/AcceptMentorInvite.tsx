
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mentorService } from '@/services/mentorService';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, X, UserRound } from 'lucide-react';

const AcceptMentorInvite: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mentorName, setMentorName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyInvite = async () => {
      if (!inviteCode) {
        setError('Invalid invitation code');
        setLoading(false);
        return;
      }

      try {
        // In a real implementation, you would verify the invite code with the server
        // For now, we'll just simulate a successful verification
        setMentorName('Trading Coach'); // This would come from the API
        setLoading(false);
      } catch (error) {
        console.error('Error verifying invite:', error);
        setError('Failed to verify invitation');
        setLoading(false);
      }
    };

    verifyInvite();
  }, [inviteCode]);

  const handleAccept = async () => {
    if (!user || !inviteCode) return;

    setLoading(true);
    try {
      const success = await mentorService.acceptMentorshipInvite(inviteCode, user.id);
      
      if (success) {
        toast({
          title: "Invitation Accepted",
          description: `You have accepted the mentorship invitation from ${mentorName}`,
        });
        navigate('/dashboard');
      } else {
        setError('Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    // In a real implementation, you would update the invitation status in the database
    toast({
      title: "Invitation Rejected",
      description: "You have declined the mentorship invitation",
    });
    navigate('/dashboard');
  };

  const handleLogin = () => {
    navigate(`/login?redirect=/accept-invite/${inviteCode}`);
  };

  const handleRegister = () => {
    navigate(`/register?redirect=/accept-invite/${inviteCode}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p>Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-purple-100 p-3 rounded-full">
            <UserRound className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-xl">Mentorship Invitation</CardTitle>
          <CardDescription>
            {mentorName} has invited you to join their mentorship program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-medium mb-2">As a mentee, you will get:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Personalized feedback on your trading performance</li>
              <li>Access to expert guidance from your mentor</li>
              <li>Detailed performance tracking and analysis</li>
              <li>Regular progress reviews and suggestions</li>
            </ul>
          </div>
          
          {!isAuthenticated && (
            <div className="bg-amber-50 p-4 rounded border border-amber-200">
              <p className="text-amber-800 text-sm">
                You need to be logged in to accept this invitation.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <>
              <Button 
                variant="default" 
                className="w-full sm:w-auto"
                onClick={handleAccept}
                disabled={loading}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accept Invitation
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={handleReject}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="default" 
                className="w-full sm:w-auto"
                onClick={handleLogin}
              >
                Login to Accept
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={handleRegister}
              >
                Register
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AcceptMentorInvite;
