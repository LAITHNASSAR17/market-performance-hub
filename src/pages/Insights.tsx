
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, BarChart, Clock, Percent as PercentIcon, LineChart, Target, Lightbulb } from 'lucide-react';
import StatCard from '@/components/StatCard';
import HashtagBadge from '@/components/HashtagBadge';
import { cn } from '@/lib/utils';
import TradingTips from '@/components/TradingTips';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';

interface InsightsProps {
  // Define any props here
}

const Insights: React.FC<InsightsProps> = ({ /* props */ }) => {
  const { trades, allHashtags, addHashtag } = useTrade();
  const { language } = useLanguage();
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const stats = useAnalyticsStats();

  // Filter trades based on selected hashtags
  const filteredTrades = trades.filter(trade =>
    selectedHashtags.every(tag => trade.hashtags.includes(tag))
  );

  // Calculate total profit/loss for filtered trades
  const totalProfitLoss = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);

  // Calculate win rate for filtered trades
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Handler for selecting/deselecting a hashtag
  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Handler for adding a new hashtag
  const handleAddHashtag = () => {
    if (newHashtag.trim() !== '') {
      addHashtag(newHashtag.trim());
      setSelectedHashtags(prev => [...prev, newHashtag.trim()]);
      setNewHashtag('');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-4 md:py-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Trading Insights</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Total Profit/Loss"
            value={`$${totalProfitLoss.toFixed(2)}`}
            trend={totalProfitLoss > 0 ? 'up' : totalProfitLoss < 0 ? 'down' : 'neutral'}
            icon={<DollarSign className="h-5 w-5" />}
            color={totalProfitLoss > 0 ? 'green' : totalProfitLoss < 0 ? 'red' : 'default'}
            description={`Trades in total: ${totalTrades}`}
          />
          <StatCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            description={`${winningTrades}/${totalTrades} trades`}
            icon={<PercentIcon className="h-5 w-5" />}
          />
          <StatCard
            title="Total Trades"
            value={totalTrades}
            icon={<BarChart className="h-5 w-5" />}
          />
          <StatCard
            title="Average Duration"
            value="N/A"
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* Hashtag Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Filter by Hashtags</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {allHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleHashtag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                  selectedHashtags.includes(tag)
                    ? "bg-blue-500 text-white dark:bg-indigo-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
          <div className="flex items-center mt-3">
            <Input
              type="text"
              placeholder="Add new hashtag"
              value={newHashtag}
              onChange={e => setNewHashtag(e.target.value)}
              className="border rounded-l px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Button
              onClick={handleAddHashtag}
              className="bg-green-500 hover:bg-green-600 text-white rounded-r px-3 py-1 text-sm"
            >
              Add
            </Button>
          </div>
        </div>

        {/* AI Trading Tips */}
        <div className="mb-6">
          <TradingTips />
        </div>

        {/* Detailed Trade Analysis */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Overview</CardTitle>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                <p>
                  Display a summary of key metrics and insights based on the filtered trades.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                <p>
                  Visualize performance metrics over time, such as profit/loss, win rate, and average trade duration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="trades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Trade List</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 dark:text-gray-300">
                  List all trades that match the selected hashtags, with details such as date, pair, profit/loss, and duration.
                </p>
                <ul className="list-disc pl-5 dark:text-white">
                  {filteredTrades.map(trade => (
                    <li key={trade.id} className="mb-1">
                      {trade.date} - {trade.pair} - <span className={trade.profitLoss > 0 ? "text-green-500" : "text-red-500"}>${trade.profitLoss.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
