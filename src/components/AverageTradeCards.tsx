
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AverageTradeCardsProps {
  avgWin?: number;
  avgLoss?: number;
  winCount?: number;
  lossCount?: number;
  averageWin?: number;
  averageLoss?: number;
  totalWins?: number;
  totalLosses?: number;
}

const AverageTradeCards: React.FC<AverageTradeCardsProps> = ({
  // Support both naming conventions
  avgWin, averageWin,
  avgLoss, averageLoss,
  winCount, totalWins,
  lossCount, totalLosses
}) => {
  // Use the provided values or their alternatives
  const win = avgWin ?? averageWin ?? 0;
  const loss = avgLoss ?? averageLoss ?? 0;
  const wins = winCount ?? totalWins ?? 0;
  const losses = lossCount ?? totalLosses ?? 0;
  
  // Calculate win/loss ratio (avoid division by zero)
  const ratio = win && loss ? Math.abs(win / loss).toFixed(2) : "0";
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-full mr-3">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      ${win.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">Avg Win/Trade</p>
                  </div>
                </div>
                <span className="text-green-500 bg-green-50 px-2 py-1 rounded text-sm font-medium">
                  {wins} trades
                </span>
              </div>
            </div>
            
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-red-50 rounded-full mr-3">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      ${Math.abs(loss).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">Avg Loss/Trade</p>
                  </div>
                </div>
                <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-sm font-medium">
                  {losses} trades
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Win/Loss Ratio</span>
                <span className="text-lg font-bold">{ratio}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AverageTradeCards;
