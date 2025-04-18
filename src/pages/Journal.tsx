import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronDown, ChevronUp, Eye, Tags, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HashtagBadge from '@/components/HashtagBadge';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/types/trade';
import TradeDetailsDialog from '@/components/TradeDetailsDialog';

const Journal: React.FC = () => {
  const { trades, allHashtags, selectedAccount } = useTrade();
  const [dateFilter, setDateFilter] = useState('all');
  const [pairFilter, setPairFilter] = useState('all');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    if (dateParam) {
      setDateFilter(dateParam);
    }
  }, [location.search]);

  const handleViewTrade = (id: string) => {
    navigate(`/trade/${id}`);
  };

  const handleViewDate = (date: string) => {
    setSelectedDate(date);
    setIsDetailsOpen(true);
  };

  const accountFilteredTrades = trades.filter(trade => trade.account === selectedAccount);
  
  const filteredTrades = accountFilteredTrades.filter(trade => {
    const matchesDate = dateFilter === 'all' || trade.date === dateFilter;
    const matchesPair = pairFilter === 'all' || trade.pair === pairFilter;
    const matchesHashtags = selectedHashtags.length === 0 || 
      selectedHashtags.every(tag => trade.hashtags.includes(tag));
    return matchesDate && matchesPair && matchesHashtags;
  });

  const pairs = Array.from(new Set(trades.map(trade => trade.pair)));

  const clearFilters = () => {
    setDateFilter('all');
    setPairFilter('all');
    setSelectedHashtags([]);
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  type TradesByDate = Record<string, {
    trades: Trade[];
    totalProfit: number;
  }>;

  const tradesByDate = filteredTrades.reduce((acc: TradesByDate, trade) => {
    if (!acc[trade.date]) {
      acc[trade.date] = {
        trades: [],
        totalProfit: 0
      };
    }
    acc[trade.date].trades.push(trade);
    acc[trade.date].totalProfit += trade.total;
    return acc;
  }, {});

  const sortedDates = Object.keys(tradesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Daily Journal</h1>
        <p className="text-gray-500">View your trading activity by day</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={dateFilter !== 'all' ? dateFilter : ''}
              onChange={(e) => setDateFilter(e.target.value || 'all')}
              className="pl-9"
            />
          </div>
          <Select value={pairFilter} onValueChange={setPairFilter}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="All pairs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pairs</SelectItem>
              {pairs.map(pair => (
                <SelectItem key={pair} value={pair}>{pair}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Tags className="h-4 w-4" />
            <span>Filter by hashtags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map(tag => (
              <Badge
                key={tag}
                variant={selectedHashtags.includes(tag) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer hover:bg-muted",
                  selectedHashtags.includes(tag) && "bg-primary text-primary-foreground"
                )}
                onClick={() => toggleHashtag(tag)}
              >
                #{tag}
                {selectedHashtags.includes(tag) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const { trades: dayTrades, totalProfit } = tradesByDate[date];
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            return (
              <Card key={date} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{formattedDate}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "text-lg font-bold",
                        totalProfit > 0 ? "text-profit" : totalProfit < 0 ? "text-loss" : "text-gray-500"
                      )}>
                        {totalProfit > 0 ? '+' : ''}{totalProfit.toFixed(2)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDate(date)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {dayTrades.map(trade => (
                      <div key={trade.id} className="p-4 hover:bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                  trade.type === 'Buy' 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                )}
                              >
                                {trade.type}
                              </span>
                              <h3 className="font-medium">{trade.pair}</h3>
                            </div>
                            
                            <div className="md:flex items-center gap-6 text-sm text-gray-500">
                              <p>Account: {trade.account}</p>
                              <p>Entry: {trade.entry} | Exit: {trade.exit}</p>
                              <p>Duration: {trade.durationMinutes} min</p>
                            </div>
                            
                            {trade.notes && (
                              <p className="mt-2 text-sm">{trade.notes}</p>
                            )}
                            
                            {trade.hashtags && trade.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {trade.hashtags.map(tag => (
                                  <HashtagBadge key={tag} tag={tag} size="sm" />
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "font-medium",
                              trade.total > 0 ? "text-profit" : "text-loss"
                            )}>
                              {trade.total > 0 ? '+' : ''}{trade.total.toFixed(2)}
                            </div>
                            
                            {trade.imageUrl && (
                              <img 
                                src={trade.imageUrl} 
                                alt="Trade chart" 
                                className="w-16 h-16 object-cover rounded border"
                              />
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewTrade(trade.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600 mb-2">No journal entries found</h3>
          <p className="text-gray-500 mb-6">
            {trades.length > 0 
              ? "Try changing your filters"
              : "Start by adding your first trade"}
          </p>
          {trades.length === 0 && (
            <Button asChild>
              <Link to="/add-trade">Add Your First Trade</Link>
            </Button>
          )}
        </div>
      )}

      <TradeDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        selectedDate={selectedDate}
        trades={trades.filter(t => t.date === selectedDate)}
      />
    </Layout>
  );
};

export default Journal;
