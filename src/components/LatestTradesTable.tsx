
import React from 'react';
import { Trade } from '@/contexts/TradeContext';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LatestTradesTableProps {
  trades: Trade[];
}

const LatestTradesTable: React.FC<LatestTradesTableProps> = ({ trades }) => {
  if (trades.length === 0) {
    return <div className="text-center py-4 text-gray-500">No trades to display</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Pair</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">P&L</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr 
              key={trade.id} 
              className={cn(
                "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                index === trades.length - 1 && "border-b-0"
              )}
            >
              <td className="px-3 py-2 whitespace-nowrap">{trade.date}</td>
              <td className="px-3 py-2 whitespace-nowrap">{trade.pair}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center">
                  {trade.type === 'Buy' ? (
                    <span className="flex items-center text-green-600">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Buy
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Sell
                    </span>
                  )}
                </div>
              </td>
              <td className={cn(
                "px-3 py-2 text-right whitespace-nowrap font-medium",
                trade.profitLoss > 0 ? "text-green-600" : 
                trade.profitLoss < 0 ? "text-red-600" : "text-gray-500"
              )}>
                ${trade.profitLoss.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LatestTradesTable;
