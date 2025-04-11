
import React from 'react';
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
import { Trade } from '@/contexts/TradeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  
  if (!selectedDate) return null;

  const dayTrades = trades.filter(trade => trade.date === selectedDate);
  const totalProfit = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winners = dayTrades.filter(trade => trade.profitLoss > 0).length;
  const losers = dayTrades.filter(trade => trade.profitLoss < 0).length;
  const winRate = dayTrades.length > 0 ? (winners / dayTrades.length) * 100 : 0;
  const volume = dayTrades.reduce((sum, trade) => sum + trade.lotSize, 0);
  
  // Generate intraday P&L chart data (simplified)
  const chartData = dayTrades.map((trade, index) => {
    // We'll simulate intraday P&L by creating points at different times
    const hour = 9 + Math.floor(index / 2);
    const minute = (index % 2) * 30;
    return {
      time: `${hour}:${minute < 10 ? '0' + minute : minute}`,
      value: trade.profitLoss
    };
  });

  // Calculate cumulative P&L for the chart
  let cumulative = 0;
  const cumulativeData = chartData.map(point => {
    cumulative += point.value;
    return {
      time: point.time,
      value: cumulative
    };
  });
  
  const formattedDate = selectedDate ? format(new Date(selectedDate), 'EEE, MMM d, yyyy') : '';
  
  const handleViewDetails = () => {
    // Navigate to journal page with the selected date
    navigate(`/journal?date=${selectedDate}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
              Net P&L: ${totalProfit.toFixed(2)}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="h-[120px] mt-4 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36B37E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#36B37E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'P&L']} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={totalProfit > 0 ? "#36B37E" : "#FF5630"}
                fill={totalProfit > 0 ? "url(#colorValue)" : "#FFE2DD"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
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
            <div className="font-bold text-lg">
              {losers === 0 ? "∞" : (Math.abs(dayTrades.filter(t => t.profitLoss > 0).reduce((sum, t) => sum + t.profitLoss, 0)) / 
              Math.abs(dayTrades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + t.profitLoss, 0) || 1)).toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
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
                <th className="px-3 py-2 text-left font-medium text-gray-500">Tags</th>
              </tr>
            </thead>
            <tbody>
              {dayTrades.map((trade) => (
                <tr key={trade.id} className="border-b hover:bg-gray-50">
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
                    <div className="flex flex-wrap gap-1">
                      {trade.hashtags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                      {trade.hashtags.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{trade.hashtags.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <DialogFooter className="mt-6 flex justify-between">
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
