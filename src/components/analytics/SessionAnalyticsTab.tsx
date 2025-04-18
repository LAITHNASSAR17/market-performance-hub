
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SessionInsights from '../insights/SessionInsights';
import { useTrade } from '@/contexts/TradeContext';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Moon, Clock, Sun, Globe, Combine } from 'lucide-react';

const SessionAnalyticsTab: React.FC = () => {
  const { trades } = useTrade();
  
  // Group trades by session
  const sessionData = React.useMemo(() => {
    const sessions: Record<string, { 
      session: string, 
      trades: number, 
      winCount: number, 
      lossCount: number, 
      netProfit: number,
      totalProfit: number,
      totalLoss: number,
      icon: JSX.Element 
    }> = {
      'Asia': { 
        session: 'Asia', 
        trades: 0, 
        winCount: 0, 
        lossCount: 0, 
        netProfit: 0,
        totalProfit: 0,
        totalLoss: 0,
        icon: <Moon className="h-4 w-4 text-indigo-500" />
      },
      'London': { 
        session: 'London', 
        trades: 0, 
        winCount: 0, 
        lossCount: 0, 
        netProfit: 0,
        totalProfit: 0,
        totalLoss: 0,
        icon: <Clock className="h-4 w-4 text-blue-500" />
      },
      'New York': { 
        session: 'New York', 
        trades: 0, 
        winCount: 0, 
        lossCount: 0, 
        netProfit: 0,
        totalProfit: 0,
        totalLoss: 0,
        icon: <Sun className="h-4 w-4 text-orange-500" />
      },
      'London Close': { 
        session: 'London Close', 
        trades: 0, 
        winCount: 0, 
        lossCount: 0, 
        netProfit: 0,
        totalProfit: 0,
        totalLoss: 0,
        icon: <Clock className="h-4 w-4 text-purple-500" />
      },
      'Overlap': { 
        session: 'Overlap', 
        trades: 0, 
        winCount: 0, 
        lossCount: 0, 
        netProfit: 0,
        totalProfit: 0,
        totalLoss: 0,
        icon: <Combine className="h-4 w-4 text-green-500" />
      },
      'Other': { 
        session: 'Other', 
        trades: 0, 
        winCount: 0, 
        lossCount: 0, 
        netProfit: 0,
        totalProfit: 0,
        totalLoss: 0,
        icon: <Globe className="h-4 w-4 text-gray-500" />
      }
    };
    
    trades.forEach(trade => {
      const sessionName = trade.marketSession || 'Other';
      if (!sessions[sessionName]) {
        sessions[sessionName] = { 
          session: sessionName, 
          trades: 0, 
          winCount: 0, 
          lossCount: 0, 
          netProfit: 0,
          totalProfit: 0,
          totalLoss: 0,
          icon: <Globe className="h-4 w-4 text-gray-500" />
        };
      }
      
      const session = sessions[sessionName];
      session.trades += 1;
      session.netProfit += trade.total;
      
      if (trade.total > 0) {
        session.winCount += 1;
        session.totalProfit += trade.total;
      } else {
        session.lossCount += 1;
        session.totalLoss += Math.abs(trade.total);
      }
    });
    
    return Object.values(sessions).filter(s => s.trades > 0);
  }, [trades]);
  
  // Data for the session comparison chart
  const chartData = sessionData.map(session => ({
    name: session.session,
    profit: session.totalProfit,
    loss: -session.totalLoss,
    net: session.netProfit,
    trades: session.trades,
    winRate: session.trades > 0 ? (session.winCount / session.trades) * 100 : 0
  }));
  
  return (
    <div className="space-y-6">
      <SessionInsights trades={trades} />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
                <Legend />
                <Bar dataKey="profit" name="Total Profit" fill="#10b981" />
                <Bar dataKey="loss" name="Total Loss" fill="#ef4444" />
                <Bar dataKey="net" name="Net P/L" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Win Rate by Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
                <Bar dataKey="winRate" name="Win Rate" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionAnalyticsTab;
