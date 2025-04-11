
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TradeStatsCard from '@/components/analytics/TradeStatsCard';
import { ArrowUpRight, ArrowDownRight, DollarSign, Target, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OverviewTabProps {
  stats: {
    totalPL: string;
    winRate: string;
    avgWin: string;
    avgLoss: string;
    largestWin: string;
    largestLoss: string;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default OverviewTab;
