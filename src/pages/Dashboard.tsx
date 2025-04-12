
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrade } from '@/contexts/TradeContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import LatestTradesTable from '@/components/LatestTradesTable';
import CumulativePLChart from '@/components/CumulativePLChart';
import DailyPLBarChart from '@/components/DailyPLBarChart';
import AverageTradeCards from '@/components/AverageTradeCards';
import TradingTips from '@/components/TradingTips';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Clipboard, 
  BarChart, 
  Calendar, 
  Filter, 
  ChevronDown, 
  Download 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { trades } = useTrade();
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Calculate statistics based on filtered trades
  const totalTrades = trades?.length || 0;
  const winningTrades = trades?.filter(trade => trade.profitLoss > 0).length || 0;
  const losingTrades = trades?.filter(trade => trade.profitLoss < 0).length || 0;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  
  // Calculate total P&L
  const totalPL = trades?.reduce((sum, trade) => sum + trade.profitLoss, 0) || 0;
  
  // Get the latest trades (max 5)
  const latestTrades = trades?.slice(0, 5) || [];

  const handleExportReport = () => {
    // Logic to generate and download report as CSV or PDF
    console.log('Exporting report');
    
    if (totalTrades === 0) {
      alert('No trades available to export');
      return;
    }
    
    // Simple CSV export
    const headers = ['Date', 'Pair', 'Type', 'Entry', 'Exit', 'Size', 'P&L'];
    const csvContent = [
      headers.join(','),
      ...trades.map(trade => 
        [
          trade.date, 
          trade.pair, 
          trade.type, 
          trade.entry, 
          trade.exit, 
          trade.lotSize, 
          trade.profitLoss
        ].join(',')
      )
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trading_report_${timeFilter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
              Trading Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor your trading performance
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <div className="flex items-center">
              <Select 
                value={timeFilter} 
                onValueChange={setTimeFilter}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportReport} 
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total P&L"
            value={`$${totalPL.toFixed(2)}`}
            icon={totalPL >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            color={totalPL > 0 ? 'green' : totalPL < 0 ? 'red' : 'default'}
            trend={totalPL > 0 ? 'up' : totalPL < 0 ? 'down' : 'neutral'}
          />
          
          <StatCard
            title="Win Rate"
            value={`${winRate}%`}
            icon={<BarChart className="h-5 w-5" />}
            color={winRate > 50 ? 'green' : winRate < 50 ? 'red' : 'default'}
          />
          
          <StatCard
            title="Total Trades"
            value={totalTrades.toString()}
            icon={<Clipboard className="h-5 w-5" />}
            description={`W: ${winningTrades} / L: ${losingTrades}`}
          />
          
          <StatCard
            title="Trading Journal"
            value={`${trades?.filter(trade => trade.notes?.length > 0).length || 0} notes`}
            icon={<FileText className="h-5 w-5" />}
            description="View your journal"
            actionUrl="/journal"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">P&L Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CumulativePLChart trades={trades || []} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Daily P&L</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DailyPLBarChart trades={trades || []} />
            </CardContent>
          </Card>
        </div>

        {/* Average Trade Stats */}
        <AverageTradeCards trades={trades || []} />

        {/* Latest Trades and Tips */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Latest Trades</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LatestTradesTable trades={latestTrades} />
              {latestTrades.length > 0 ? (
                <div className="mt-2 text-right">
                  <Button variant="link" size="sm" asChild>
                    <a href="/trades">View all trades</a>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No trades yet. Add your first trade to start tracking.</p>
                  <Button className="mt-2" asChild>
                    <a href="/add-trade">Add Trade</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Trading Tips</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TradingTips />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
