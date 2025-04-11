
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import PlaybookCard from '@/components/analytics/PlaybookCard';
import { Target, Repeat, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  rating: number;
  tags: string[];
}

interface PlaybookTabProps {
  playbooks: PlaybookEntry[];
}

const PlaybookTab: React.FC<PlaybookTabProps> = ({ playbooks }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handleSelectPlaybook = (id: string) => {
    toast({
      title: "Playbook selected",
      description: `Playbook details will be displayed here.`
    });
  };
  
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default PlaybookTab;
