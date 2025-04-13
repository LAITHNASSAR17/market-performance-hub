
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ITrade } from '@/services/tradeService';

interface RecentTradesProps {
  trades: ITrade[];
  onViewTrade: (id: string) => void;
  onDeleteTrade: (id: string, e: React.MouseEvent) => void;
}

const RecentTrades: React.FC<RecentTradesProps> = ({
  trades,
  onViewTrade,
  onDeleteTrade
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Recent trades</TabsTrigger>
            <TabsTrigger value="open">Open positions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-sm">
                    <th className="text-left p-2 border-b">Date</th>
                    <th className="text-left p-2 border-b">Symbol</th>
                    <th className="text-right p-2 border-b">Volume</th>
                    <th className="text-right p-2 border-b">Entry</th>
                    <th className="text-right p-2 border-b">Exit</th>
                    <th className="text-right p-2 border-b">P/L</th>
                    <th className="text-center p-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trades.length > 0 ? (
                    trades.map((trade) => (
                      <tr 
                        key={trade.id} 
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => onViewTrade(trade.id)}
                      >
                        <td className="p-2 text-sm">{formatDate(trade.entryDate)}</td>
                        <td className="p-2 text-sm font-medium">{trade.symbol}</td>
                        <td className="p-2 text-sm text-right">{trade.quantity.toFixed(2)}</td>
                        <td className="p-2 text-sm text-right">{trade.entryPrice.toFixed(2)}</td>
                        <td className="p-2 text-sm text-right">{trade.exitPrice ? trade.exitPrice.toFixed(2) : '-'}</td>
                        <td className={cn(
                          "p-2 text-sm text-right font-medium",
                          (trade.profitLoss || 0) > 0 ? "text-emerald-600" : 
                          (trade.profitLoss || 0) < 0 ? "text-red-600" : ""
                        )}>
                          {trade.profitLoss !== null ? trade.profitLoss.toFixed(2) : '-'}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewTrade(trade.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={(e) => onDeleteTrade(trade.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-500">
                        No trades found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="open">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-sm">
                    <th className="text-left p-2 border-b">Open date</th>
                    <th className="text-left p-2 border-b">Symbol</th>
                    <th className="text-right p-2 border-b">Volume</th>
                    <th className="text-right p-2 border-b">Entry</th>
                    <th className="text-center p-2 border-b">Status</th>
                    <th className="text-center p-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trades.filter(t => !t.exitDate).length > 0 ? (
                    trades.filter(t => !t.exitDate).map((trade) => (
                      <tr 
                        key={trade.id} 
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => onViewTrade(trade.id)}
                      >
                        <td className="p-2 text-sm">{formatDate(trade.entryDate)}</td>
                        <td className="p-2 text-sm font-medium">{trade.symbol}</td>
                        <td className="p-2 text-sm text-right">{trade.quantity.toFixed(2)}</td>
                        <td className="p-2 text-sm text-right">{trade.entryPrice.toFixed(2)}</td>
                        <td className="p-2 text-sm text-center">
                          <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                            Open
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewTrade(trade.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={(e) => onDeleteTrade(trade.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No open positions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentTrades;
