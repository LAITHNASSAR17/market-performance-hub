
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrade } from '@/contexts/TradeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Filter, Hash, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';

interface HashtagDetailProps {
  tag: string;
  trades: any[];
  onClose: () => void;
}

const HashtagDetail: React.FC<HashtagDetailProps> = ({ tag, trades, onClose }) => {
  const filteredTrades = trades.filter(trade => trade.hashtags.includes(tag));
  
  const stats = useMemo(() => {
    if (!filteredTrades.length) return { totalPL: 0, winRate: 0, avgProfit: 0, tradeCount: 0 };
    
    const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0);
    return {
      totalPL: filteredTrades.reduce((sum, trade) => sum + trade.total, 0),
      winRate: Math.round((winningTrades.length / filteredTrades.length) * 100),
      avgProfit: filteredTrades.length > 0 
        ? Math.round(filteredTrades.reduce((sum, trade) => sum + trade.total, 0) / filteredTrades.length) 
        : 0,
      tradeCount: filteredTrades.length
    };
  }, [filteredTrades]);

  // Find related setups and notes
  const relatedSetups = useMemo(() => {
    const setupsMap = new Map();
    filteredTrades.forEach(trade => {
      trade.hashtags.forEach(hashtag => {
        if (hashtag !== tag) {
          setupsMap.set(hashtag, (setupsMap.get(hashtag) || 0) + 1);
        }
      });
    });
    return Array.from(setupsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [filteredTrades, tag]);

  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          <span>{tag}</span>
          <Badge variant={stats.totalPL >= 0 ? "success" : "destructive"} className="ml-2">
            ${stats.totalPL}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Analysis of all trades using this hashtag
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.tradeCount}</div>
            <p className="text-sm text-muted-foreground">Total Trades</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <p className="text-sm text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${stats.avgProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${stats.avgProfit}
            </div>
            <p className="text-sm text-muted-foreground">Avg. Profit/Loss</p>
          </CardContent>
        </Card>
      </div>

      {relatedSetups.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Related Hashtags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {relatedSetups.map(setup => (
              <Badge key={setup.tag} variant="outline" className="text-sm py-1">
                #{setup.tag} ({setup.count})
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Trades</h3>
        <div className="space-y-2">
          {filteredTrades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
              <div>
                <div className="font-medium">{trade.pair}</div>
                <div className="text-sm text-muted-foreground">{format(new Date(trade.date), 'MMM dd, yyyy')}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`${trade.total >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                  ${trade.total}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
          
          {filteredTrades.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">
              No trades found with this hashtag
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

const HashtagsTab = () => {
  const { trades, tradingAccounts } = useTrade();
  const { theme } = useTheme();
  const [dateFilter, setDateFilter] = useState<string>("last30days");
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 30));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Handle date range selection
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    const today = new Date();
    
    switch (value) {
      case "last7days":
        setFromDate(subDays(today, 7));
        setToDate(today);
        break;
      case "last30days":
        setFromDate(subDays(today, 30));
        setToDate(today);
        break;
      case "thisMonth":
        setFromDate(startOfMonth(today));
        setToDate(endOfMonth(today));
        break;
      case "custom":
        setIsDatePickerOpen(true);
        break;
      default:
        // Default to last 30 days
        setFromDate(subDays(today, 30));
        setToDate(today);
    }
  };

  // Filter trades based on selected date range and account
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const isInDateRange = isWithinInterval(tradeDate, { start: fromDate, end: toDate });
      const isInSelectedAccount = selectedAccount === "all" || trade.account === selectedAccount;
      
      return isInDateRange && isInSelectedAccount;
    });
  }, [trades, fromDate, toDate, selectedAccount]);

  // Calculate hashtag statistics from filtered trades
  const hashtagStats = useMemo(() => {
    const stats = new Map<string, { count: number; profitLoss: number }>();
    
    filteredTrades.forEach(trade => {
      trade.hashtags.forEach(tag => {
        if (!stats.has(tag)) {
          stats.set(tag, { count: 0, profitLoss: 0 });
        }
        const tagStats = stats.get(tag)!;
        tagStats.count += 1;
        tagStats.profitLoss += trade.total;
      });
    });

    return Array.from(stats.entries()).map(([tag, data]) => ({
      tag,
      count: data.count,
      profitLoss: Number(data.profitLoss.toFixed(2)),
      avgProfitLoss: Number((data.profitLoss / data.count).toFixed(2))
    }));
  }, [filteredTrades]);

  // Sort hashtags by usage count
  const sortedByCount = [...hashtagStats].sort((a, b) => b.count - a.count);
  
  // Sort hashtags by profit/loss
  const sortedByProfitLoss = [...hashtagStats].sort((a, b) => b.profitLoss - a.profitLoss);

  // Top 3 hashtags
  const topThreeByProfit = sortedByProfitLoss.slice(0, 3);
  const topThreeByCount = sortedByCount.slice(0, 3);

  const chartColors = {
    positive: theme === 'dark' ? '#22c55e' : '#16a34a',
    negative: theme === 'dark' ? '#ef4444' : '#dc2626',
    neutral: theme === 'dark' ? '#3b82f6' : '#2563eb'
  };

  // Get all unique account names from trades
  const accounts = useMemo(() => {
    const accountSet = new Set<string>(trades.map(trade => trade.account));
    return Array.from(accountSet);
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Date Range:</span>
        </div>
        <Select value={dateFilter} onValueChange={handleDateFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateFilter === "custom" && (
          <div className="flex items-center gap-2">
            <span className="text-sm">From</span>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(fromDate, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(date) => {
                    if (date) {
                      setFromDate(date);
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span className="text-sm">To</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(toDate, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(date) => {
                    if (date) {
                      setToDate(date);
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Account:</span>
        </div>
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account} value={account}>
                {account}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 hashtags summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              Most Profitable Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topThreeByProfit.length > 0 ? (
                topThreeByProfit.map((stat, index) => (
                  <div 
                    key={stat.tag} 
                    className="flex justify-between items-center p-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => setSelectedHashtag(stat.tag)}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                        {index + 1}
                      </div>
                      <span>#{stat.tag}</span>
                    </div>
                    <span className={`font-medium ${stat.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${stat.profitLoss}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Hash className="h-4 w-4 mr-2 text-blue-500" />
              Most Used Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topThreeByCount.length > 0 ? (
                topThreeByCount.map((stat, index) => (
                  <div 
                    key={stat.tag} 
                    className="flex justify-between items-center p-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => setSelectedHashtag(stat.tag)}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                        {index + 1}
                      </div>
                      <span>#{stat.tag}</span>
                    </div>
                    <span className="font-medium">
                      {stat.count} trades
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Used Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByCount.slice(0, 10)}>
                <XAxis dataKey="tag" />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    name === 'count' ? `${value} trades` : `$${value}`,
                    name === 'count' ? 'Usage Count' : 'Average P/L'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  name="Usage Count" 
                  onClick={(data) => setSelectedHashtag(data.tag)}
                  cursor="pointer"
                >
                  {sortedByCount.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={index}
                      fill={entry.profitLoss >= 0 ? chartColors.positive : chartColors.negative}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Profitable Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByProfitLoss.slice(0, 10)}>
                <XAxis dataKey="tag" />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value) => [`$${value}`, 'Total P/L']}
                />
                <Bar 
                  dataKey="profitLoss" 
                  name="Total P/L" 
                  onClick={(data) => setSelectedHashtag(data.tag)}
                  cursor="pointer"
                >
                  {sortedByProfitLoss.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={index}
                      fill={entry.profitLoss >= 0 ? chartColors.positive : chartColors.negative}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedByProfitLoss.slice(0, 6).map(stat => (
              <div 
                key={stat.tag} 
                className="p-4 rounded-lg border bg-card text-card-foreground cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedHashtag(stat.tag)}
              >
                <p className="text-sm font-medium">#{stat.tag}</p>
                <p className={`text-xl font-bold ${
                  stat.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ${stat.profitLoss}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.count} trades (avg. ${stat.avgProfitLoss})
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span>Red = Net Loss</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>Green = Net Profit</span>
        </div>
      </div>

      {/* Hashtag detail dialog */}
      {selectedHashtag && (
        <Dialog open={!!selectedHashtag} onOpenChange={(open) => !open && setSelectedHashtag(null)}>
          <HashtagDetail 
            tag={selectedHashtag} 
            trades={filteredTrades} 
            onClose={() => setSelectedHashtag(null)} 
          />
        </Dialog>
      )}
    </div>
  );
};

export default HashtagsTab;
