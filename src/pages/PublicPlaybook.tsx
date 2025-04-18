
import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicPlaybook } from '@/services/playbookService';
import { PlaybookEntry } from '@/hooks/usePlaybooks';
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Percent, ArrowRightLeft, BarChart, 
  Coins, Hash, Trophy, AlertTriangle, Star, ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PublicPlaybook: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [playbook, setPlaybook] = useState<PlaybookEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaybook = async () => {
      if (!token) {
        setError("No playbook identifier provided");
        setLoading(false);
        return;
      }

      try {
        const data = await getPublicPlaybook(token);
        if (data) {
          setPlaybook(data);
        } else {
          setError("Playbook not found or is not public");
        }
      } catch (err) {
        console.error("Error fetching playbook:", err);
        setError("Failed to load playbook");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybook();
  }, [token]);

  // Get category colors
  const getCategoryColor = (category?: string) => {
    switch(category) {
      case 'trend': return 'bg-blue-500';
      case 'breakout': return 'bg-green-500';
      case 'reversal': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-6" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !playbook) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {error || "Playbook not found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The playbook you're looking for doesn't exist or is no longer public.
          </p>
          <Button asChild>
            <RouterLink to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </RouterLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <RouterLink to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </RouterLink>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(playbook.category)}`}></div>
              <CardTitle className="text-2xl">
                {playbook.name}
              </CardTitle>
              <div className="ml-2 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${
                      star <= Math.round(playbook.rating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 capitalize text-sm">
              {playbook.category || 'Uncategorized'} Trading Strategy
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {playbook.description || "No description provided"}
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {playbook.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-lg">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Percent className="h-3 w-3 mr-1" /> Win Rate
                  </div>
                  <div className="text-xl font-bold">{playbook.win_rate || 0}%</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> R-Multiple
                  </div>
                  <div className="text-xl font-bold">{playbook.r_multiple || 0}R</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <BarChart className="h-3 w-3 mr-1" /> Profit Factor
                  </div>
                  <div className="text-xl font-bold">{playbook.profit_factor?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <ArrowRightLeft className="h-3 w-3 mr-1" /> Expectancy
                  </div>
                  <div className="text-xl font-bold">{playbook.expected_value || 0}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Hash className="h-3 w-3 mr-1" /> Total Trades
                  </div>
                  <div className="text-xl font-bold">{playbook.total_trades || 0}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Coins className="h-3 w-3 mr-1" /> Net P/L
                  </div>
                  <div className={`text-xl font-bold ${
                    (playbook.net_profit_loss || 0) > 0 ? 'text-green-500' : 
                    (playbook.net_profit_loss || 0) < 0 ? 'text-red-500' : ''
                  }`}>
                    ${playbook.net_profit_loss?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Trophy className="h-3 w-3 mr-1" /> Avg. Winner
                  </div>
                  <div className="text-xl font-bold text-green-500">${playbook.avg_winner?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Avg. Loser
                  </div>
                  <div className="text-xl font-bold text-red-500">${playbook.avg_loser?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
            
            {playbook.rules && playbook.rules.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Trading Rules</h3>
                <div className="space-y-3">
                  {['entry', 'exit', 'risk', 'custom'].map((ruleType) => {
                    const rules = playbook.rules?.filter(r => r.type === ruleType);
                    if (!rules || rules.length === 0) return null;
                    
                    return (
                      <div key={ruleType} className="space-y-1">
                        <h4 className="text-sm font-medium capitalize">{ruleType} Rules</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {rules.map((rule) => (
                            <li key={rule.id} className="text-gray-700 dark:text-gray-300">
                              {rule.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="border-t pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              This trading playbook is shared publicly via TrackMind.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicPlaybook;
