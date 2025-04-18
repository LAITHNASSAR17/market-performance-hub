
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrade } from '@/contexts/TradeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

const HashtagsTab = () => {
  const { trades } = useTrade();
  const { theme } = useTheme();

  // Calculate hashtag statistics
  const hashtagStats = React.useMemo(() => {
    const stats = new Map<string, { count: number; profitLoss: number }>();
    
    trades.forEach(trade => {
      trade.hashtags.forEach(tag => {
        if (!stats.has(tag)) {
          stats.set(tag, { count: 0, profitLoss: 0 });
        }
        const tagStats = stats.get(tag)!;
        tagStats.count += 1;
        tagStats.profitLoss += trade.total;
      });
    });

    return Array.from(stats.entries()).map(([tag, data]) => ({
      tag,
      count: data.count,
      profitLoss: Number(data.profitLoss.toFixed(2)),
      avgProfitLoss: Number((data.profitLoss / data.count).toFixed(2))
    }));
  }, [trades]);

  // Sort hashtags by usage count
  const sortedByCount = [...hashtagStats].sort((a, b) => b.count - a.count);
  
  // Sort hashtags by profit/loss
  const sortedByProfitLoss = [...hashtagStats].sort((a, b) => b.profitLoss - a.profitLoss);

  const chartColors = {
    positive: theme === 'dark' ? '#22c55e' : '#16a34a',
    negative: theme === 'dark' ? '#ef4444' : '#dc2626',
    neutral: theme === 'dark' ? '#3b82f6' : '#2563eb'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Most Used Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByCount.slice(0, 10)}>
                <XAxis dataKey="tag" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? `${value} trades` : `$${value}`,
                    name === 'count' ? 'Usage Count' : 'Average P/L'
                  ]}
                />
                <Bar dataKey="count" name="Usage Count">
                  {sortedByCount.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={index}
                      fill={entry.profitLoss >= 0 ? chartColors.positive : chartColors.negative}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Profitable Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByProfitLoss.slice(0, 10)}>
                <XAxis dataKey="tag" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Total P/L']}
                />
                <Bar dataKey="profitLoss" name="Total P/L">
                  {sortedByProfitLoss.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={index}
                      fill={entry.profitLoss >= 0 ? chartColors.positive : chartColors.negative}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedByProfitLoss.slice(0, 6).map(stat => (
              <div 
                key={stat.tag} 
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                <p className="text-sm font-medium">#{stat.tag}</p>
                <p className={`text-xl font-bold ${
                  stat.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ${stat.profitLoss}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.count} trades (avg. ${stat.avgProfitLoss})
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HashtagsTab;
