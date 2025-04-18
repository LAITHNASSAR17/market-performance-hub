
import React, { useMemo } from 'react';
import { Trade } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Clock, Sun, Moon, Combine } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type SessionStat = {
  session: string;
  trades: number;
  winRate: number;
  netPL: number;
  profitFactor: number;
  icon: React.ReactNode;
};

// Function to get icon for each session
const getSessionIcon = (session: string) => {
  switch (session) {
    case 'Asia':
      return <Moon className="h-4 w-4 text-indigo-500" />;
    case 'London':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'New York':
      return <Sun className="h-4 w-4 text-orange-500" />;
    case 'London Close':
      return <Clock className="h-4 w-4 text-purple-500" />;
    case 'Overlap':
      return <Combine className="h-4 w-4 text-green-500" />;
    default:
      return <Globe className="h-4 w-4 text-gray-500" />;
  }
};

interface SessionInsightsProps {
  trades: Trade[];
}

const SessionInsights: React.FC<SessionInsightsProps> = ({ trades }) => {
  const { t } = useLanguage();
  
  const sessionStats = useMemo(() => {
    const sessions: Record<string, SessionStat> = {
      'Asia': { session: 'Asia', trades: 0, winRate: 0, netPL: 0, profitFactor: 0, icon: getSessionIcon('Asia') },
      'London': { session: 'London', trades: 0, winRate: 0, netPL: 0, profitFactor: 0, icon: getSessionIcon('London') },
      'New York': { session: 'New York', trades: 0, winRate: 0, netPL: 0, profitFactor: 0, icon: getSessionIcon('New York') },
      'London Close': { session: 'London Close', trades: 0, winRate: 0, netPL: 0, profitFactor: 0, icon: getSessionIcon('London Close') },
      'Overlap': { session: 'Overlap', trades: 0, winRate: 0, netPL: 0, profitFactor: 0, icon: getSessionIcon('Overlap') },
      'Other': { session: 'Other', trades: 0, winRate: 0, netPL: 0, profitFactor: 0, icon: getSessionIcon('Other') },
    };
    
    // Group trades by session and calculate stats
    trades.forEach(trade => {
      const session = trade.marketSession || 'Other';
      if (!sessions[session]) {
        sessions[session] = { 
          session, 
          trades: 0, 
          winRate: 0, 
          netPL: 0, 
          profitFactor: 0,
          icon: getSessionIcon(session)
        };
      }
      
      const statObj = sessions[session];
      statObj.trades += 1;
      statObj.netPL += trade.total;
      
      // Track wins for win rate
      if (trade.profitLoss > 0) {
        statObj.winRate += 1;
      }
    });
    
    // Calculate derived stats
    Object.values(sessions).forEach(sessionStat => {
      if (sessionStat.trades > 0) {
        sessionStat.winRate = (sessionStat.winRate / sessionStat.trades) * 100;
        
        // Calculate profit factor
        let totalGain = 0;
        let totalLoss = 0;
        
        trades
          .filter(t => (t.marketSession || 'Other') === sessionStat.session)
          .forEach(trade => {
            if (trade.total > 0) {
              totalGain += trade.total;
            } else {
              totalLoss += Math.abs(trade.total);
            }
          });
        
        sessionStat.profitFactor = totalLoss === 0 ? totalGain : totalGain / totalLoss;
      }
    });
    
    return Object.values(sessions).filter(s => s.trades > 0);
  }, [trades]);
  
  // Find best-performing session
  const bestSession = useMemo(() => {
    if (sessionStats.length === 0) return null;
    
    // Sort by profitFactor, then by winRate, then by netPL
    return [...sessionStats].sort((a, b) => {
      if (b.profitFactor !== a.profitFactor) return b.profitFactor - a.profitFactor;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.netPL - a.netPL;
    })[0];
  }, [sessionStats]);
  
  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Performance by Session</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No trading data available. Add trades with session information to see insights.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">📊 Performance by Session</CardTitle>
      </CardHeader>
      <CardContent>
        {bestSession && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 font-medium text-sm mb-1">
              {bestSession.icon}
              <span>Best-performing session: <span className="font-bold">{bestSession.session}</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              Profit factor: {bestSession.profitFactor.toFixed(2)} | Win rate: {bestSession.winRate.toFixed(0)}% | Net P/L: ${bestSession.netPL.toFixed(2)}
            </p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Net P/L</TableHead>
                <TableHead>Profit Factor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionStats.map(stat => (
                <TableRow key={stat.session}>
                  <TableCell className="flex items-center gap-2">
                    {stat.icon}
                    {stat.session}
                  </TableCell>
                  <TableCell>{stat.trades}</TableCell>
                  <TableCell>{stat.winRate.toFixed(0)}%</TableCell>
                  <TableCell className={stat.netPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${stat.netPL.toFixed(2)}
                  </TableCell>
                  <TableCell>{stat.profitFactor.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionInsights;
