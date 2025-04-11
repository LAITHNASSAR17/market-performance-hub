import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, BarChart, Clock, Percent as PercentIcon, LineChart, Target } from 'lucide-react';
import StatCard from '@/components/StatCard';
import HashtagBadge from '@/components/HashtagBadge';
import { cn } from '@/lib/utils';

interface InsightsProps {
  // Define any props here
}

const Insights: React.FC<InsightsProps> = ({ /* props */ }) => {
  const { trades, allHashtags, addHashtag } = useTrade();
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');

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
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4">Trading Insights</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Profit/Loss"
            value={`$${totalProfitLoss.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={totalProfitLoss > 0 ? 'up' : totalProfitLoss < 0 ? 'down' : 'neutral'}
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Filter by Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleHashtag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  selectedHashtags.includes(tag)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                #{tag}
              </button>
            ))}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add new hashtag"
                value={newHashtag}
                onChange={e => setNewHashtag(e.target.value)}
                className="border rounded-l px-2 py-1 text-sm"
              />
              <button
                onClick={handleAddHashtag}
                className="bg-green-500 text-white rounded-r px-3 py-1 text-sm hover:bg-green-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Trade Analysis */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Overview</h3>
              <p>
                Display a summary of key metrics and insights based on the filtered trades.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Performance Analysis</h3>
              <p>
                Visualize performance metrics over time, such as profit/loss, win rate, and
                average trade duration.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="trades" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Trade List</h3>
              <p>
                List all trades that match the selected hashtags, with details such as date,
                pair, profit/loss, and duration.
              </p>
              <ul className="list-disc pl-5">
                {filteredTrades.map(trade => (
                  <li key={trade.id}>
                    {trade.date} - {trade.pair} - ${trade.profitLoss.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
