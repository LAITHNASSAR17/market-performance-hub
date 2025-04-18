
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BadgePercent, 
  BarChart2, 
  LineChart, 
  TrendingUp, 
  Hash,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardCheck,
  Grid2X2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlaybookEntry, PlaybookRule } from '@/hooks/usePlaybooks';
import { supabase } from '@/lib/supabase';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PublicPlaybook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playbook, setPlaybook] = useState<PlaybookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaybook = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('playbooks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          const formattedPlaybook: PlaybookEntry = {
            id: data.id,
            name: data.name,
            description: data.description || '',
            rating: data.rating || 0,
            tags: data.tags || [],
            rMultiple: data.r_multiple,
            winRate: data.win_rate,
            expectedValue: data.expected_value,
            profitFactor: data.profit_factor,
            totalTrades: data.total_trades || 0,
            averageProfit: data.average_profit,
            category: data.category as any || 'other',
            isPrivate: data.is_private || false,
            avgWinner: data.avg_winner,
            avgLoser: data.avg_loser,
            missedTrades: data.missed_trades || 0,
            netProfitLoss: data.net_profit_loss || 0,
            rules: (data.rules as any as PlaybookRule[]) || []
          };
          setPlaybook(formattedPlaybook);
        } else {
          setError('Playbook not found');
        }
      } catch (err: any) {
        console.error('Error fetching playbook:', err);
        setError(err.message || 'Failed to load playbook');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlaybook();
    }
  }, [id]);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'trend': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'reversal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'breakout': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-lg text-gray-600">Loading playbook...</p>
      </div>
    );
  }

  if (error || !playbook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-4xl mb-4">!</div>
        <h1 className="text-2xl font-bold mb-2">Playbook Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The requested playbook does not exist or is not public.'}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>{playbook.name} | Trading Playbook</title>
      </Helmet>
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(playbook.category)}>
                  {playbook.category || 'General'}
                </Badge>
                <div className="flex items-center">
                  {Array.from({length: 5}).map((_, index) => (
                    <svg 
                      key={index}
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${index < playbook.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">{playbook.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{playbook.description}</p>
            </div>
          </div>
          
          {playbook.tags && playbook.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {playbook.tags.map(tag => (
                <Badge key={tag} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <BadgePercent className="h-4 w-4 mr-2 text-indigo-500" />
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{playbook.winRate ? `${playbook.winRate}%` : 'N/A'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    <CardTitle className="text-sm font-medium">R-Multiple</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{playbook.rMultiple ? playbook.rMultiple.toFixed(2) : 'N/A'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-purple-500" />
                    <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{playbook.profitFactor ? playbook.profitFactor.toFixed(2) : 'N/A'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                    <CardTitle className="text-sm font-medium">Expected Value</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{playbook.expectedValue ? playbook.expectedValue.toFixed(2) : 'N/A'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-orange-500" />
                    <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{playbook.totalTrades || 'N/A'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />
                    <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${playbook.netProfitLoss > 0 ? 'text-green-500' : playbook.netProfitLoss < 0 ? 'text-red-500' : ''}`}>
                    {playbook.netProfitLoss > 0 ? '+' : ''}
                    ${playbook.netProfitLoss ? playbook.netProfitLoss.toFixed(2) : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Winner</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center">
                    <ArrowUpRight className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">${playbook.avgWinner ? playbook.avgWinner.toFixed(2) : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Loser</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center">
                    <ArrowDownRight className="h-5 w-5 mr-2 text-red-500" />
                    <span className="text-2xl font-bold text-red-500">${playbook.avgLoser ? playbook.avgLoser.toFixed(2) : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  Trading Rules
                </CardTitle>
                <CardDescription>The specific rules and guidelines for this trading playbook</CardDescription>
              </CardHeader>
              <CardContent>
                {playbook.rules && playbook.rules.length > 0 ? (
                  <div className="space-y-6">
                    {[
                      { type: 'entry', title: 'Entry Rules', icon: <ArrowUpRight className="h-4 w-4" /> },
                      { type: 'exit', title: 'Exit Rules', icon: <ArrowDownRight className="h-4 w-4" /> },
                      { type: 'risk', title: 'Risk Management', icon: <BarChart2 className="h-4 w-4" /> },
                      { type: 'custom', title: 'Other Guidelines', icon: <Grid2X2 className="h-4 w-4" /> }
                    ].map(category => {
                      const categoryRules = playbook.rules?.filter(rule => rule.type === category.type) || [];
                      if (categoryRules.length === 0) return null;
                      
                      return (
                        <div key={category.type}>
                          <h3 className="text-lg font-medium flex items-center mb-3">
                            {category.icon}
                            <span className="ml-2">{category.title}</span>
                          </h3>
                          <ul className="space-y-2 ml-6 list-disc">
                            {categoryRules.map(rule => (
                              <li key={rule.id} className="text-gray-700 dark:text-gray-300">
                                {rule.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No trading rules have been defined for this playbook.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicPlaybook;
