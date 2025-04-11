
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { ChartLine, ChartBarIcon, Target, DollarSign, CircleCheck, CircleX, Lightbulb, BookMarked, Repeat, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import TradeStatsCard from '@/components/analytics/TradeStatsCard';
import TagList from '@/components/analytics/TagList';
import RunningPLChart from '@/components/analytics/RunningPLChart';
import PlaybookCard from '@/components/analytics/PlaybookCard';

const Analytics: React.FC = () => {
  const { t } = useLanguage();
  const { trades } = useTrade();
  const { toast } = useToast();
  
  // State for tags
  const [mistakes, setMistakes] = useState<string[]>(['late entry', 'hesitated', 'left profits on the table']);
  const [setups, setSetups] = useState<string[]>(['gap and go', 'pullback', 'breakout']);
  const [habits, setHabits] = useState<string[]>(['had a game plan', 'slept well', 'morning routine']);
  
  // State for running P&L data
  const [plData, setPLData] = useState<{ time: string; value: number }[]>([]);
  
  // State for playbook
  const [playbooks, setPlaybooks] = useState<any[]>([
    {
      id: '1',
      name: 'Pullback Retest',
      description: 'Trading the retracement from key levels after a strong move',
      rating: 4.5,
      tags: ['pullback', 'retracement', 'trend']
    },
    {
      id: '2',
      name: 'Breakout Setup',
      description: 'Trading the breakout from key resistance or support levels',
      rating: 4.0,
      tags: ['breakout', 'momentum', 'volume']
    }
  ]);
  
  // Generate Running P&L data
  useEffect(() => {
    const generatePLData = () => {
      const hours = ['09:14', '09:16', '09:18', '09:20', '09:22', '09:24', '09:26', '09:28', '09:30', '09:32', '09:34', '09:36', '09:38', '09:40', '09:42'];
      const values = [-30, -250, -650, -680, -600, -400, -150, -300, -530, -550, -400, -550, -650, -150, 600];
      
      return hours.map((time, index) => ({
        time,
        value: values[index]
      }));
    };
    
    setPLData(generatePLData());
  }, []);
  
  // Calculate stats from trades
  const calculateStats = () => {
    if (!trades.length) {
      return {
        totalPL: '$0.00',
        winRate: '0%',
        avgWin: '$0.00',
        avgLoss: '$0.00',
        largestWin: '$0.00',
        largestLoss: '$0.00',
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0
      };
    }
    
    const totalPL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const winningTrades = trades.filter(trade => trade.profitLoss > 0);
    const losingTrades = trades.filter(trade => trade.profitLoss < 0);
    
    const winRate = (winningTrades.length / trades.length) * 100;
    
    const avgWin = winningTrades.length ? 
      winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / winningTrades.length : 
      0;
      
    const avgLoss = losingTrades.length ? 
      losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / losingTrades.length : 
      0;
      
    const largestWin = winningTrades.length ? 
      Math.max(...winningTrades.map(trade => trade.profitLoss)) : 
      0;
      
    const largestLoss = losingTrades.length ? 
      Math.min(...losingTrades.map(trade => trade.profitLoss)) : 
      0;
    
    return {
      totalPL: `$${totalPL.toFixed(2)}`,
      winRate: `${winRate.toFixed(1)}%`,
      avgWin: `$${avgWin.toFixed(2)}`,
      avgLoss: `$${avgLoss.toFixed(2)}`,
      largestWin: `$${largestWin.toFixed(2)}`,
      largestLoss: `$${largestLoss.toFixed(2)}`,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length
    };
  };
  
  const stats = calculateStats();
  
  // Tag management functions
  const handleAddMistake = (tag: string) => {
    if (!mistakes.includes(tag)) {
      setMistakes([...mistakes, tag]);
      toast({
        title: "Mistake added",
        description: `"${tag}" has been added to your mistakes list.`
      });
    }
  };
  
  const handleRemoveMistake = (tag: string) => {
    setMistakes(mistakes.filter(t => t !== tag));
  };
  
  const handleAddSetup = (tag: string) => {
    if (!setups.includes(tag)) {
      setSetups([...setups, tag]);
      toast({
        title: "Setup added",
        description: `"${tag}" has been added to your setups list.`
      });
    }
  };
  
  const handleRemoveSetup = (tag: string) => {
    setSetups(setups.filter(t => t !== tag));
  };
  
  const handleAddHabit = (tag: string) => {
    if (!habits.includes(tag)) {
      setHabits([...habits, tag]);
      toast({
        title: "Habit added",
        description: `"${tag}" has been added to your habits list.`
      });
    }
  };
  
  const handleRemoveHabit = (tag: string) => {
    setHabits(habits.filter(t => t !== tag));
  };
  
  const handleSelectPlaybook = (id: string) => {
    toast({
      title: "Playbook selected",
      description: `Playbook details will be displayed here.`
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title') || 'Analytics'}</h1>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 md:w-[400px] mb-4">
            <TabsTrigger value="overview">
              <ChartLine className="h-4 w-4 mr-2" />
              {t('analytics.overview') || 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Target className="h-4 w-4 mr-2" />
              {t('analytics.tags') || 'Tags'}
            </TabsTrigger>
            <TabsTrigger value="playbook">
              <BookMarked className="h-4 w-4 mr-2" />
              {t('analytics.playbook') || 'Playbook'}
            </TabsTrigger>
            <TabsTrigger value="chart">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              {t('analytics.chart') || 'Chart'}
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TradeStatsCard
                title={t('analytics.netPL') || 'Net P&L'}
                value={stats.totalPL}
                type={parseFloat(stats.totalPL.replace('$', '')) >= 0 ? 'profit' : 'loss'}
                icon={<DollarSign className="h-4 w-4" />}
                additionalStats={[
                  { label: t('analytics.tradesToday') || 'Trades Today', value: '3' },
                  { label: t('analytics.plToday') || 'P&L Today', value: '$600.00' }
                ]}
              />
              
              <TradeStatsCard
                title={t('analytics.winRate') || 'Win Rate'}
                value={stats.winRate}
                icon={<Target className="h-4 w-4" />}
                additionalStats={[
                  { label: t('analytics.wins') || 'Wins', value: stats.winningTrades },
                  { label: t('analytics.losses') || 'Losses', value: stats.losingTrades }
                ]}
              />
              
              <TradeStatsCard
                title={t('analytics.avgWin') || 'Average Win'}
                value={stats.avgWin}
                type="profit"
                icon={<ArrowUpRight className="h-4 w-4" />}
                additionalStats={[
                  { label: t('analytics.largestWin') || 'Largest Win', value: stats.largestWin }
                ]}
              />
              
              <TradeStatsCard
                title={t('analytics.avgLoss') || 'Average Loss'}
                value={stats.avgLoss}
                type="loss"
                icon={<ArrowDownRight className="h-4 w-4" />}
                additionalStats={[
                  { label: t('analytics.largestLoss') || 'Largest Loss', value: stats.largestLoss }
                ]}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium">{t('analytics.tradeStats') || 'Trade Statistics'}</CardTitle>
                  <CardDescription>
                    {t('analytics.tradeStatsDesc') || 'Details of your recent trading performance'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.side') || 'Side'}</h3>
                    <div className="text-2xl font-bold">LONG</div>
                    <div className="text-sm text-muted-foreground">{t('analytics.contractsTraded') || 'Contracts Traded'}: 30</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.grossPL') || 'Gross P&L'}</h3>
                    <div className="text-2xl font-bold">$600.00</div>
                    <div className="text-sm text-muted-foreground">{t('analytics.playbook') || 'Playbook'}: Pullback Retest</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.riskMultiple') || 'Risk Multiple'}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">{t('analytics.planned') || 'Planned'}</span>
                        <span className="font-medium">5.00R</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{t('analytics.realized') || 'Realized'}</span>
                        <span className="font-medium">2.00R</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.tradingRating') || 'Trade Rating'}</h3>
                    <div className="flex">
                      {[1, 2, 3, 4].map(n => (
                        <Star key={n} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">4.0/5.0</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.profitTarget') || 'Profit Target'}</h3>
                    <div className="text-xl">$5358.0</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.stopLoss') || 'Stop Loss'}</h3>
                    <div className="text-xl">$5346.0</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.initialTarget') || 'Initial Target'}</h3>
                    <div className="text-xl text-green-500">$1,500.00</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('analytics.tradeRisk') || 'Trade Risk'}</h3>
                    <div className="text-xl text-red-500">-$300.00</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TagList
                title={t('analytics.mistakes') || 'Mistakes'}
                icon={<CircleX className="h-4 w-4" />}
                color="bg-red-500"
                tags={mistakes}
                onAddTag={handleAddMistake}
                onRemoveTag={handleRemoveMistake}
              />
              
              <TagList
                title={t('analytics.setups') || 'Setups'}
                icon={<Target className="h-4 w-4" />}
                color="bg-blue-500"
                tags={setups}
                onAddTag={handleAddSetup}
                onRemoveTag={handleRemoveSetup}
              />
              
              <TagList
                title={t('analytics.habits') || 'Habits'}
                icon={<Lightbulb className="h-4 w-4" />}
                color="bg-purple-500"
                tags={habits}
                onAddTag={handleAddHabit}
                onRemoveTag={handleRemoveHabit}
              />
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.tagTrend') || 'Tag Trends'}</CardTitle>
                  <CardDescription>
                    {t('analytics.tagTrendDesc') || 'Analyze how different tags affect your trading performance'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">{t('analytics.topMistakes') || 'Top Mistakes (by P&L impact)'}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">late entry</span>
                          <div className="flex items-center text-red-500">
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            <span>-$520.00</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">hesitated</span>
                          <div className="flex items-center text-red-500">
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            <span>-$350.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">{t('analytics.bestSetups') || 'Best Setups (by win rate)'}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">pullback</span>
                          <div className="flex items-center text-green-500">
                            <CircleCheck className="h-4 w-4 mr-1" />
                            <span>78% win rate</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">gap and go</span>
                          <div className="flex items-center text-green-500">
                            <CircleCheck className="h-4 w-4 mr-1" />
                            <span>65% win rate</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">{t('analytics.positiveHabits') || 'Positive Habits (by performance)'}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">had a game plan</span>
                          <div className="flex items-center text-green-500">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            <span>+$980.00 avg.</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">slept well</span>
                          <div className="flex items-center text-green-500">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            <span>+$750.00 avg.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Playbook Tab */}
          <TabsContent value="playbook" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playbooks.map(playbook => (
                <PlaybookCard 
                  key={playbook.id} 
                  playbook={playbook} 
                  onSelect={handleSelectPlaybook} 
                />
              ))}
              
              <Card className="w-full border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors duration-200">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-muted w-10 h-10 flex items-center justify-center mb-3">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('analytics.addPlaybook') || 'Add new playbook...'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t('analytics.playbookDetails') || 'Playbook Details'}</CardTitle>
                  <CardDescription>
                    {t('analytics.playbookDetailsDesc') || 'Analyze and improve your trading strategies'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">{t('analytics.playbookName') || 'Playbook Name'}</h3>
                        <p className="text-lg font-medium">Pullback Retest</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">{t('analytics.description') || 'Description'}</h3>
                        <p className="text-sm">
                          Trading the retracement from key levels after a strong move. This setup works best during trending markets when price pulls back to test a previous breakout level.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">{t('analytics.entryRules') || 'Entry Rules'}</h3>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          <li>Identify the trend direction on higher timeframe</li>
                          <li>Wait for pullback to key support/resistance</li>
                          <li>Look for rejection candle at level</li>
                          <li>Enter on break of rejection candle high/low</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">{t('analytics.exitRules') || 'Exit Rules'}</h3>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          <li>Place stop below/above the rejection candle</li>
                          <li>Partial take profit at 1:1 risk/reward</li>
                          <li>Move stop to breakeven after 1:1</li>
                          <li>Final take profit at previous swing high/low</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">{t('analytics.performance') || 'Performance'}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('analytics.winRate') || 'Win Rate'}</p>
                            <p className="text-lg font-medium">78%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('analytics.avgRR') || 'Avg. R:R'}</p>
                            <p className="text-lg font-medium">2.3R</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('analytics.trades') || 'Trades'}</p>
                            <p className="text-lg font-medium">36</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('analytics.expectancy') || 'Expectancy'}</p>
                            <p className="text-lg font-medium">1.64R</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">{t('analytics.bestTimeframes') || 'Best Timeframes'}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge>15min</Badge>
                          <Badge>1h</Badge>
                          <Badge>4h</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">{t('analytics.bestPairs') || 'Best Performing Pairs'}</h3>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between">
                            <span>EUR/USD</span>
                            <span className="font-medium">82% win rate</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GBP/USD</span>
                            <span className="font-medium">75% win rate</span>
                          </div>
                          <div className="flex justify-between">
                            <span>USD/JPY</span>
                            <span className="font-medium">70% win rate</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" className="mr-2">
                          <Repeat className="h-4 w-4 mr-2" />
                          {t('analytics.backtest') || 'Backtest'}
                        </Button>
                        <Button>
                          <Target className="h-4 w-4 mr-2" />
                          {t('analytics.usePlaybook') || 'Use Playbook'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Chart Tab */}
          <TabsContent value="chart" className="space-y-4">
            <RunningPLChart data={plData} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.pairPerformance') || 'Pair Performance'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">EUR/USD</span>
                        <span className="text-sm font-medium text-green-500">+$850.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">GBP/USD</span>
                        <span className="text-sm font-medium text-green-500">+$320.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">USD/JPY</span>
                        <span className="text-sm font-medium text-red-500">-$150.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-red-500 rounded-full h-2" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">AUD/USD</span>
                        <span className="text-sm font-medium text-red-500">-$420.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-red-500 rounded-full h-2" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.timeOfDay') || 'Time of Day Performance'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">9:00 - 10:00</span>
                        <span className="text-sm font-medium text-green-500">+$920.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">10:00 - 11:00</span>
                        <span className="text-sm font-medium text-green-500">+$450.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">11:00 - 12:00</span>
                        <span className="text-sm font-medium text-red-500">-$180.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-red-500 rounded-full h-2" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">12:00 - 13:00</span>
                        <span className="text-sm font-medium text-red-500">-$350.00</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-red-500 rounded-full h-2" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
