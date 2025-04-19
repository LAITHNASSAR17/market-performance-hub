import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useMentorship } from '@/contexts/MentorshipContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Users } from 'lucide-react';
import CumulativePLChart from '@/components/CumulativePLChart';
import AverageTradeCards from '@/components/AverageTradeCards';
import { ITrade } from '@/services/tradeService';
import { supabase } from '@/lib/supabase';

interface MenteeStats {
  id: string;
  name: string;
  email: string;
  totalPL: number;
  winRate: number;
  tradeCount: number;
  avgWin: number;
  avgLoss: number;
  winCount: number;
  lossCount: number;
  trades: any[];
  color: string;
  status: 'pending' | 'accepted';
}

const CHART_COLORS = [
  '#8B5CF6', // Vivid Purple
  '#F97316', // Bright Orange
  '#0EA5E9', // Ocean Blue
  '#22C55E', // Green
  '#EF4444'  // Red
];

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { mentorships, isLoading } = useMentorship();
  const navigate = useNavigate();
  const [menteeStats, setMenteeStats] = useState<MenteeStats[]>([]);
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isLoading && mentorships.length === 0) {
      setIsLoadingStats(false);
    }

    if (mentorships.some(m => m.mentor_id === user.id)) {
      fetchMenteeStats();
    }
  }, [user, mentorships, isLoading]);

  const fetchMenteeStats = async () => {
    setIsLoadingStats(true);
    
    try {
      const acceptedMentorships = mentorships.filter(
        m => m.mentor_id === user?.id && m.status === 'accepted' && m.mentee_id
      );

      const pendingMentorships = mentorships.filter(
        m => m.mentor_id === user?.id && m.status === 'pending'
      );

      const menteeStatsPromises = [...acceptedMentorships, ...pendingMentorships].map(async (mentorship, index) => {
        if (!mentorship.mentee_id) {
          return {
            id: mentorship.id,
            name: 'Pending Invitation',
            email: mentorship.invite_email || 'No email',
            totalPL: 0,
            winRate: 0,
            tradeCount: 0,
            avgWin: 0,
            avgLoss: 0,
            winCount: 0,
            lossCount: 0,
            trades: [],
            status: 'pending',
            color: CHART_COLORS[index % CHART_COLORS.length]
          };
        }

        const { data: menteeData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', mentorship.mentee_id)
          .single();

        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', mentorship.mentee_id);

        if (!trades) return null;

        const totalPL = trades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
        const winningTrades = trades.filter(trade => (trade.profit_loss || 0) > 0);
        const losingTrades = trades.filter(trade => (trade.profit_loss || 0) < 0);
        const winCount = winningTrades.length;
        const lossCount = losingTrades.length;
        const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;
        const avgWin = winCount > 0 
          ? winningTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0) / winCount 
          : 0;
        const avgLoss = lossCount > 0 
          ? losingTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0) / lossCount 
          : 0;

        return {
          id: mentorship.mentee_id,
          name: menteeData?.name || 'Unknown',
          email: menteeData?.email || 'Unknown',
          totalPL,
          winRate,
          tradeCount: trades.length,
          avgWin,
          avgLoss,
          winCount,
          lossCount,
          trades: trades.map(trade => ({
            id: trade.id,
            date: trade.entry_date.split('T')[0],
            profitLoss: trade.profit_loss || 0
          })),
          status: 'accepted',
          color: CHART_COLORS[index % CHART_COLORS.length]
        };
      });

      const stats = await Promise.all(menteeStatsPromises);
      setMenteeStats(stats.filter(Boolean) as MenteeStats[]);
    } catch (error) {
      console.error("Error fetching mentee stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleMenteeSelection = (menteeId: string) => {
    setSelectedMentees(prev => {
      if (prev.includes(menteeId)) {
        return prev.filter(id => id !== menteeId);
      }
      
      if (prev.length >= 5) {
        return prev;
      }
      
      return [...prev, menteeId];
    });
  };

  const getSelectedMenteeTrades = () => {
    return menteeStats
      .filter(mentee => selectedMentees.includes(mentee.id) && mentee.status === 'accepted')
      .flatMap(mentee => 
        mentee.trades.map(trade => ({
          ...trade,
          menteeId: mentee.id,
          menteeName: mentee.name,
          color: mentee.color
        }))
      );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Mentor Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} />
                <span>My Mentees</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : menteeStats.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">No mentees yet.</p>
                  <p className="text-sm text-gray-400">Invite traders to mentor them.</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {menteeStats.map((mentee) => (
                      <div key={mentee.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Checkbox 
                          id={`select-${mentee.id}`}
                          checked={selectedMentees.includes(mentee.id)}
                          disabled={mentee.status !== 'accepted' || (!selectedMentees.includes(mentee.id) && selectedMentees.length >= 5)}
                          onCheckedChange={() => handleMenteeSelection(mentee.id)}
                        />
                        <Avatar className="border-2" style={{borderColor: mentee.color}}>
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${mentee.name}`} />
                          <AvatarFallback>{mentee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{mentee.name}</span>
                            {mentee.status === 'pending' && (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{mentee.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Net Cumulative P&L Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMentees.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select up to 5 mentees to compare their performance</p>
                  </div>
                ) : (
                  <CumulativePLChart 
                    trades={getSelectedMenteeTrades()} 
                    timeRange="month" 
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mentee Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : menteeStats.filter(m => m.status === 'accepted').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No active mentees to show statistics for.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mentee</TableHead>
                        <TableHead>Net P&L</TableHead>
                        <TableHead>Win Rate</TableHead>
                        <TableHead>Trades</TableHead>
                        <TableHead>Avg Win</TableHead>
                        <TableHead>Avg Loss</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menteeStats
                        .filter(mentee => mentee.status === 'accepted')
                        .map((mentee) => (
                        <TableRow key={mentee.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mentee.color }}></div>
                              {mentee.name}
                            </div>
                          </TableCell>
                          <TableCell className={`font-medium ${mentee.totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${mentee.totalPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{mentee.winRate.toFixed(1)}%</TableCell>
                          <TableCell>{mentee.tradeCount}</TableCell>
                          <TableCell className="text-green-600">
                            ${mentee.avgWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-red-600">
                            ${Math.abs(mentee.avgLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {selectedMentees.length === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menteeStats
                  .filter(mentee => selectedMentees.includes(mentee.id) && mentee.status === 'accepted')
                  .map(mentee => (
                    <AverageTradeCards
                      key={mentee.id}
                      avgWin={mentee.avgWin}
                      avgLoss={mentee.avgLoss}
                      winCount={mentee.winCount}
                      lossCount={mentee.lossCount}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MentorDashboard;
