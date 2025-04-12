
import React from 'react';
import { useTrade } from '@/contexts/TradeContext';
import { useAccount } from '@/contexts/AccountContext';
import { User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface UserPerformanceProps {
  userId: string;
  userName: string;
}

const UserPerformance: React.FC<UserPerformanceProps> = ({ userId, userName }) => {
  const { trades, getAllTrades } = useTrade();
  const { accounts } = useAccount();
  
  // Get all trades for this user
  const userTrades = getAllTrades().filter(trade => trade.userId === userId);
  
  // Get user's accounts
  const userAccounts = accounts.filter(account => account.userId === userId);
  
  // Calculate statistics
  const totalTrades = userTrades.length;
  const winningTrades = userTrades.filter(trade => trade.profitLoss > 0).length;
  const losingTrades = userTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const totalProfit = userTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  
  // Calculate trading pairs stats
  const pairStats: Record<string, { count: number, profit: number }> = {};
  userTrades.forEach(trade => {
    if (!pairStats[trade.pair]) {
      pairStats[trade.pair] = { count: 0, profit: 0 };
    }
    pairStats[trade.pair].count += 1;
    pairStats[trade.pair].profit += trade.profitLoss;
  });
  
  const pairStatsArray = Object.entries(pairStats)
    .map(([pair, stats]) => ({ pair, ...stats }))
    .sort((a, b) => b.count - a.count);
  
  // Get best and worst trades
  const bestTrade = userTrades.length > 0 
    ? userTrades.reduce((best, trade) => trade.profitLoss > best.profitLoss ? trade : best, userTrades[0])
    : null;
    
  const worstTrade = userTrades.length > 0
    ? userTrades.reduce((worst, trade) => trade.profitLoss < worst.profitLoss ? trade : worst, userTrades[0])
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
          <User className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{userName}</h2>
          <p className="text-gray-500 text-sm">User ID: {userId}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trading Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500 text-sm">Total Trades</dt>
                <dd className="font-medium">{totalTrades}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 text-sm">Win Rate</dt>
                <dd className="font-medium">{winRate.toFixed(1)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 text-sm">Total P&L</dt>
                <dd className={cn(
                  "font-medium",
                  totalProfit > 0 ? "text-emerald-500" : totalProfit < 0 ? "text-red-500" : ""
                )}>
                  {totalProfit > 0 ? "+" : ""}{totalProfit.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 text-sm">Best Trade</dt>
                <dd className={cn(
                  "font-medium",
                  bestTrade && bestTrade.profitLoss > 0 ? "text-emerald-500" : bestTrade?.profitLoss < 0 ? "text-red-500" : ""
                )}>
                  {bestTrade ? `+${bestTrade.profitLoss.toFixed(2)}` : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 text-sm">Worst Trade</dt>
                <dd className={cn(
                  "font-medium",
                  worstTrade && worstTrade.profitLoss < 0 ? "text-red-500" : ""
                )}>
                  {worstTrade ? worstTrade.profitLoss.toFixed(2) : "N/A"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trading Accounts</CardTitle>
            <CardDescription className="text-xs">{userAccounts.length} accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {userAccounts.length > 0 ? (
              <div className="space-y-3">
                {userAccounts.map(account => (
                  <div key={account.id} className="p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{account.name}</span>
                      <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                        {account.type}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {account.broker}
                    </div>
                    <div className="mt-1 flex justify-between text-sm">
                      <span>Balance: <span className="font-medium">{account.currency} {account.balance.toLocaleString()}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No accounts found</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trading Pairs</CardTitle>
            <CardDescription className="text-xs">{pairStatsArray.length} pairs traded</CardDescription>
          </CardHeader>
          <CardContent>
            {pairStatsArray.length > 0 ? (
              <div className="h-[180px] overflow-y-auto pr-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pair</TableHead>
                      <TableHead className="text-right">Trades</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pairStatsArray.map(({ pair, count, profit }) => (
                      <TableRow key={pair}>
                        <TableCell className="font-medium">{pair}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          profit > 0 ? "text-emerald-500" : profit < 0 ? "text-red-500" : ""
                        )}>
                          {profit > 0 ? "+" : ""}{profit.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No trading pairs data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPerformance;
