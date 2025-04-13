
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface WinrateDonutProps {
  winRate: number;
  wins: number;
  losses: number;
  title: string;
}

const WinrateDonut: React.FC<WinrateDonutProps> = ({ winRate, wins, losses, title }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          {title}
          <CircleIcon className="h-3 w-3 ml-2 text-blue-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] sm:h-[240px] flex flex-col sm:flex-row items-center justify-center">
          <div className="relative w-[160px] sm:w-[180px] h-[160px] sm:h-[180px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-500">{winRate.toFixed(0)}%</span>
              <span className="text-sm text-gray-500">winrate</span>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f1f1f1"
                strokeWidth="15"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={wins > 0 ? "#36B37E" : "#f1f1f1"}
                strokeWidth="15"
                strokeDasharray={`${winRate * 2.512} ${(100 - winRate) * 2.512}`}
                strokeDashoffset="0"
                transform="rotate(-90, 50, 50)"
              />
            </svg>
          </div>
          <div className="ml-0 mt-4 sm:mt-0 sm:ml-4">
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                <span className="text-sm">{wins} {t('analytics.winners') || 'winners'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-sm">{losses} {t('analytics.losers') || 'losers'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface WinrateChartsProps {
  winRate: number;
  winningTrades: number;
  losingTrades: number;
}

const WinrateCharts: React.FC<WinrateChartsProps> = ({ 
  winRate,
  winningTrades,
  losingTrades
}) => {
  const { t } = useLanguage();
  
  // Calculate winning days stats - placeholder data, should be replaced with actual data
  const winningDays = 15;
  const losingDays = 0;
  const dayWinRate = losingDays > 0 ? (winningDays / (winningDays + losingDays)) * 100 : 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WinrateDonut 
        winRate={winRate}
        wins={winningTrades}
        losses={losingTrades}
        title={t('analytics.winningByTrades') || 'Winning % By Trades'}
      />
      
      <WinrateDonut 
        winRate={dayWinRate}
        wins={winningDays}
        losses={losingDays}
        title={t('analytics.winningByDays') || 'Winning % By Days'}
      />
    </div>
  );
};

export default WinrateCharts;
