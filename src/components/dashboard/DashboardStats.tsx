
import React from 'react';
import { DollarSign, Activity } from 'lucide-react';
import StatCard from '@/components/StatCard';
import AverageTradeCards from '@/components/AverageTradeCards';

interface DashboardStatsProps {
  totalProfit: number;
  totalTradesCount: number;
  profitFactor: number;
  avgWinningTrade: number;
  avgLosingTrade: number;
  winningTrades: number;
  losingTrades: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalProfit,
  totalTradesCount,
  profitFactor,
  avgWinningTrade,
  avgLosingTrade,
  winningTrades,
  losingTrades
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
      <StatCard
        title="إجمالي الربح/الخسارة"
        value={`$${totalProfit.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`}
        trend={totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'neutral'}
        icon={<DollarSign className="h-5 w-5" />}
        color={totalProfit > 0 ? 'green' : totalProfit < 0 ? 'red' : 'default'}
        description={`إجمالي الصفقات: ${totalTradesCount}`}
      />
      <StatCard
        title="معامل الربح"
        value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
        icon={<Activity className="h-5 w-5" />}
        description={`${profitFactor > 1 ? '+' : ''}${profitFactor === Infinity ? "" : (profitFactor - 1).toFixed(2)}`}
      />
      
      <div className="md:col-span-2">
        <AverageTradeCards 
          avgWin={avgWinningTrade} 
          avgLoss={avgLosingTrade}
          winCount={winningTrades}
          lossCount={losingTrades}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
