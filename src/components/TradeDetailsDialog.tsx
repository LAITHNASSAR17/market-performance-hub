import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ExternalLink, Eye, Trash2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { useToast } from '@/components/ui/use-toast';

interface TradeDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  trades: Trade[];
}

const TradeDetailsDialog: React.FC<TradeDetailsDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  trades
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const { deleteTrade } = useTrade();
  const { playbooks } = usePlaybooks();
  const { toast } = useToast();
  
  if (!selectedDate) return null;

  const dayTrades = trades.filter(trade => trade.date === selectedDate);
  const totalProfit = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winners = dayTrades.filter(trade => trade.profitLoss > 0).length;
  const losers = dayTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = dayTrades.length > 0 ? (winners / dayTrades.length) * 100 : 0;
  const volume = dayTrades.reduce((sum, trade) => sum + trade.lotSize, 0);
  
  const grossProfit = dayTrades
    .filter(trade => trade.profitLoss > 0)
    .reduce((sum, trade) => sum + trade.profitLoss, 0);
  
  const grossLoss = Math.abs(dayTrades
    .filter(trade => trade.profitLoss < 0)
    .reduce((sum, trade) => sum + trade.profitLoss, 0));
  
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (winners > 0 ? "∞" : "0.00");
  
  const netROI = dayTrades.length > 0 
    ? (totalProfit / volume) * 100 
    : 0;
  
  const adjustedCost = grossLoss * 0.05;
  
  const chartData = [];
  let runningTotal = 0;

  dayTrades.forEach((trade, index) => {
    const hour = 9 + Math.floor(index / 2);
    const minute = (index % 2) * 30;
    const timeLabel = `${hour}:${minute < 10 ? '0' + minute : minute}`;
    
    runningTotal += trade.profitLoss;
    
    chartData.push({
      time: timeLabel,
      value: runningTotal,
      tradeValue: trade.profitLoss
    });
  });
  
  const formattedDate = selectedDate ? format(new Date(selectedDate), 'EEE, MMM d, yyyy') : '';
  
  const handleViewDetails = () => {
    navigate(`/journal?date=${selectedDate}`);
    onClose();
  };

  const navigateToTrade = (tradeId: string) => {
    navigate(`/trade/${tradeId}`);
    onClose();
  };
  
  const handleDeleteTrade = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTrade(id);
    toast({
      title: "Trade deleted",
      description: "Trade has been successfully removed"
    });
  };

  const samplePlaybooks = [
    {
      id: "1",
      name: "Breakout Strategy",
      description: "Trading breakouts from key resistance levels",
      winRate: 68,
      rMultiple: "1.8",
      expectedValue: "1.2",
      rating: 4,
      tags: ["breakout", "momentum", "trend"]
    },
    {
      id: "2",
      name: "Pullback Entry",
      description: "Entering on pullbacks in strong trending markets",
      winRate: 72,
      rMultiple: "2.1",
      expectedValue: "1.5",
      rating: 5,
      tags: ["pullback", "trend", "retracement"]
    }
  ];
  
  const relevantPlaybooks = playbooks.length > 0 ? playbooks.slice(0, 2) : samplePlaybooks;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] w-[1000px] h-[90vh] max-h-[800px] overflow-hidden flex flex-col p-4">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {formattedDate}
              <Button variant="ghost" size="icon" className="ml-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className={cn(
              "font-mono text-xl",
              totalProfit > 0 ? "text-emerald-500" : "text-red-500"
            )}>
              NET P&L: ${totalProfit.toFixed(2)}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="stats" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#36B37E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#36B37E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cumulative P&L']} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={totalProfit >= 0 ? "#36B37E" : "#FF5630"}
                      fill={totalProfit >= 0 ? "url(#colorValue)" : "#FFE2DD"}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Trade P&L']} />
                    <ReferenceLine y={0} stroke="#666" />
                    <Bar 
                      dataKey="tradeValue" 
                      fill="#36B37E" 
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.tradeValue >= 0 ? "#36B37E" : "#FF5630"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Trades</div>
                <div className="font-bold text-lg">{dayTrades.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Winners</div>
                <div className="font-bold text-lg text-emerald-500">{winners}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Losers</div>
                <div className="font-bold text-lg text-red-500">{losers}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Win Rate</div>
                <div className="font-bold text-lg">{winRate.toFixed(0)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Volume</div>
                <div className="font-bold text-lg">{volume.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Profit Factor</div>
                <div className="font-bold text-lg">{profitFactor}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Options traded</span>
                  <span className="font-medium">{dayTrades.length}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Commissions & Fees</span>
                  <span className="font-medium">$0.00</span>
                </div>
                
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Net ROI</span>
                  <span className={cn(
                    "font-medium",
                    netROI > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    ({Math.abs(netROI).toFixed(2)}%)
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Gross P&L</span>
                  <span className={cn(
                    "font-medium",
                    grossProfit > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    ${grossProfit.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Adjusted cost</span>
                  <span className="font-medium">${adjustedCost.toFixed(2)}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Avg Win Size</span>
                  <span className="font-medium text-emerald-500">
                    ${winners > 0 ? (grossProfit / winners).toFixed(2) : "0.00"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Avg Loss Size</span>
                  <span className="font-medium text-red-500">
                    -${losers > 0 ? (grossLoss / losers).toFixed(2) : "0.00"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Largest Win</span>
                  <span className="font-medium text-emerald-500">
                    ${winners > 0 ? Math.max(...dayTrades.filter(t => t.profitLoss > 0).map(t => t.profitLoss)).toFixed(2) : "0.00"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm font-medium">Largest Loss</span>
                  <span className="font-medium text-red-500">
                    ${losers > 0 ? Math.abs(Math.min(...dayTrades.filter(t => t.profitLoss < 0).map(t => t.profitLoss))).toFixed(2) : "0.00"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Win/Loss Ratio</span>
                  <span className="font-medium">
                    {losers > 0 ? (winners / losers).toFixed(2) : (winners > 0 ? "∞" : "0.00")}
                  </span>
                </div>
              </div>
            </div>
          
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Time</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Symbol</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Side</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Entry</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Exit</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Size</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">P&L</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">R-Multiple</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Rating</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Tags</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dayTrades.map((trade, index) => (
                    <tr 
                      key={trade.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToTrade(trade.id)}
                    >
                      <td className="px-3 py-2">{format(new Date(), 'HH:mm:ss')}</td>
                      <td className="px-3 py-2">{trade.pair}</td>
                      <td className="px-3 py-2">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          trade.type === 'Buy' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        )}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-3 py-2">{trade.entry.toFixed(4)}</td>
                      <td className="px-3 py-2">{trade.exit.toFixed(4)}</td>
                      <td className="px-3 py-2">{trade.lotSize}</td>
                      <td className={cn(
                        "px-3 py-2 font-medium",
                        trade.profitLoss > 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        {trade.stopLoss ? (Math.abs(trade.profitLoss) / Math.abs(trade.entry - trade.stopLoss)).toFixed(2) : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= trade.rating 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {trade.hashtags.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                          {trade.hashtags.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{trade.hashtags.length - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToTrade(trade.id);
                            }}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleDeleteTrade(trade.id, e)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="playbooks" className="flex-1 overflow-y-auto pr-2">
            {relevantPlaybooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantPlaybooks.map(playbook => (
                  <div key={playbook.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold">{playbook.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{playbook.description}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-gray-500">Win Rate</div>
                        <div className="font-bold">{playbook.winRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">R-Multiple</div>
                        <div className="font-bold">{playbook.rMultiple}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Expected Value</div>
                        <div className="font-bold">{playbook.expectedValue}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Rating</div>
                        <div className="font-bold">{playbook.rating}/5</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-1">
                      {playbook.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No playbooks defined for this day</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-shrink-0 mt-4 flex justify-between">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleViewDetails} className="flex items-center">
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDetailsDialog;
