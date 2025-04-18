
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useMentor } from '@/contexts/MentorContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { 
  UsersRound, 
  UserPlus, 
  Link as LinkIcon, 
  Mail, 
  Trash2, 
  PlayCircle,
  ClipboardCopy, 
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const MAX_MENTEES_CHART = 5;
const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MentorDashboard: React.FC = () => {
  const { 
    mentees, 
    loading, 
    inviteMentee, 
    cancelMentorship,
    switchToMenteeView 
  } = useMentor();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCreatingInviteLink, setIsCreatingInviteLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  // Filter only accepted mentees for performance chart
  const acceptedMentees = mentees.filter(mentee => mentee.status === 'accepted');
  
  // Dummy performance data until we can fetch this from the database
  // In a real implementation, you would fetch daily P&L for each mentee
  const generatePerformanceData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dataPoint: Record<string, any> = {
        date: format(date, 'MM/dd')
      };
      
      // Add data for each accepted mentee
      acceptedMentees.slice(0, MAX_MENTEES_CHART).forEach((mentee, index) => {
        const previous = i < 30 ? data[data.length - 1][`mentee${index}`] || 0 : 0;
        const change = (Math.random() * 200) - 100; // Random P&L between -100 and 100
        dataPoint[`mentee${index}`] = previous + change;
        dataPoint[`mentee${index}Name`] = mentee.name;
      });
      
      data.push(dataPoint);
    }
    
    return data;
  };
  
  const performanceData = generatePerformanceData();
  
  const handleInvite = async () => {
    if (!emailInput.trim()) return;
    
    const success = await inviteMentee(emailInput);
    if (success) {
      setEmailInput('');
      setIsInviteDialogOpen(false);
    }
  };
  
  const handleCreateInviteLink = () => {
    // Generate a dummy invite link - in a real implementation, you would create a link in the database
    const dummyLink = `${window.location.origin}/accept-invite/${Math.random().toString(36).substring(2, 10)}`;
    setInviteLink(dummyLink);
    setIsCreatingInviteLink(true);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied to clipboard",
      description: "The invite link has been copied to your clipboard",
    });
  };
  
  const handleNavigateToMenteeNotes = (menteeId: string) => {
    // First switch to mentee view
    switchToMenteeView(menteeId);
    // Then navigate to the notebook page
    navigate('/notebook');
  };
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.payload[`mentee${index}Name`] || `Mentee ${index + 1}`}: ${entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">🎓 Mentor Dashboard</h1>
          <p className="text-gray-500">Manage your mentees and track their performance</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Invite Mentee</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a Mentee</DialogTitle>
                <DialogDescription>
                  Send an invitation to a mentee by email or create a shareable link.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="email">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email Invitation</TabsTrigger>
                  <TabsTrigger value="link">Shareable Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="email"
                          placeholder="Enter mentee email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-4">
                    <Button onClick={handleInvite} disabled={!emailInput.trim()}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </TabsContent>
                
                <TabsContent value="link" className="mt-4">
                  {!isCreatingInviteLink ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Create a shareable link that you can send to your mentee via any communication channel.
                      </p>
                      <Button onClick={handleCreateInviteLink}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Create Invite Link
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Share this link with your mentee. They can use it to join your mentorship program.
                      </p>
                      <div className="flex space-x-2">
                        <Input value={inviteLink} readOnly />
                        <Button variant="outline" onClick={handleCopyLink}>
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        This link will expire in 7 days.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mentee Performance Comparison</CardTitle>
            <CardDescription>
              Cumulative P&L over the last 30 days for up to {MAX_MENTEES_CHART} mentees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {acceptedMentees.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {acceptedMentees.slice(0, MAX_MENTEES_CHART).map((mentee, index) => (
                      <Line
                        key={mentee.id}
                        type="monotone"
                        dataKey={`mentee${index}`}
                        name={mentee.name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <UsersRound className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">No mentees found. Invite mentees to see their performance here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentee Stats</CardTitle>
            <CardDescription>
              Detailed statistics and management for all your mentees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">Loading mentee data...</div>
            ) : mentees.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Net P&L</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                      <TableHead className="text-right">Avg. Win</TableHead>
                      <TableHead className="text-right">Avg. Loss</TableHead>
                      <TableHead className="text-right">Trades</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentees.map((mentee) => (
                      <TableRow key={mentee.mentorshipId}>
                        <TableCell className="font-medium">{mentee.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            mentee.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {mentee.status === 'accepted' ? 'Active' : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right ${
                          mentee.netProfitLoss > 0 
                            ? 'text-green-600' 
                            : mentee.netProfitLoss < 0 
                              ? 'text-red-600' 
                              : ''
                        }`}>
                          {mentee.status === 'accepted' 
                            ? `$${mentee.netProfitLoss.toFixed(2)}` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {mentee.status === 'accepted' 
                            ? `${mentee.winRate.toFixed(1)}%` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {mentee.status === 'accepted' && mentee.avgWin !== 0
                            ? `$${mentee.avgWin.toFixed(2)}` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {mentee.status === 'accepted' && mentee.avgLoss !== 0
                            ? `$${mentee.avgLoss.toFixed(2)}` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {mentee.status === 'accepted' 
                            ? mentee.totalTrades 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {mentee.status === 'accepted' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => switchToMenteeView(mentee.id)}
                                title="View as mentee"
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {mentee.status === 'accepted' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNavigateToMenteeNotes(mentee.id)}
                                title="Mentor notes"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelMentorship(mentee.mentorshipId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Cancel mentorship"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center">
                <UsersRound className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No mentees found. Invite mentees to start tracking their performance.</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Your First Mentee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite a Mentee</DialogTitle>
                      <DialogDescription>
                        Send an invitation to a mentee by email.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-invite">Email Address</Label>
                        <Input
                          id="email-invite"
                          placeholder="Enter mentee email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleInvite} disabled={!emailInput.trim()}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MentorDashboard;
