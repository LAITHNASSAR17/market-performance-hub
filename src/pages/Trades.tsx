
// This file should work fine with our updated Trade type, 
// since it uses the properties that were already defined.
// No changes needed, but we're checking for completeness.

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import TradeCard from '@/components/TradeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Grid, List, Eye, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import HashtagBadge from '@/components/HashtagBadge';
import { useToast } from '@/components/ui/use-toast';

const Trades: React.FC = () => {
  const { trades, deleteTrade, pairs } = useTrade();
  const [searchTerm, setSearchTerm] = useState('');
  const [pairFilter, setPairFilter] = useState('all');
  const [tradeTypeFilter, setTradeTypeFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const navigate = useNavigate();
  const { toast } = useToast();

  const accounts = Array.from(new Set(trades.map(trade => trade.account)));

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = searchTerm === '' || 
      trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) || 
      trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPair = pairFilter === 'all' || trade.pair === pairFilter;
    const matchesType = tradeTypeFilter === 'all' || trade.type === tradeTypeFilter;
    const matchesAccount = accountFilter === 'all' || trade.account === accountFilter;
    
    return matchesSearch && matchesPair && matchesType && matchesAccount;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleEditTrade = (id: string) => {
    navigate(`/edit-trade/${id}`);
  };

  const handleDeleteTrade = (id: string) => {
    setTradeToDelete(id);
  };

  const confirmDelete = () => {
    if (tradeToDelete) {
      deleteTrade(tradeToDelete);
      setTradeToDelete(null);
      toast({
        title: "Trade deleted",
        description: "The trade has been successfully deleted",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPairFilter('all');
    setTradeTypeFilter('all');
    setAccountFilter('all');
  };

  const handleViewTrade = (id: string) => {
    navigate(`/trade/${id}`);
  };

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Your Trades</h1>
          <p className="text-gray-500 truncate">
            {sortedTrades.length} trades found
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account} value={account}>{account}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/add-trade">
              <Plus className="mr-2 h-4 w-4" />
              Add Trade
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
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
          <Select value={tradeTypeFilter} onValueChange={setTradeTypeFilter}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="border border-input rounded-md overflow-hidden inline-flex">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-none",
              viewMode === 'grid' && "bg-accent"
            )}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-none",
              viewMode === 'list' && "bg-accent"
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {sortedTrades.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrades.map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
                onView={handleViewTrade}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Pair</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Entry</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Exit</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Lot Size</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">P&L</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Tags</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTrades.map((trade) => (
                    <tr key={trade.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">{format(new Date(trade.date), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 font-medium">{trade.pair}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={trade.type === 'Buy' ? "success" : "destructive"} 
                          className="font-medium"
                        >
                          {trade.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{trade.entry}</td>
                      <td className="px-4 py-3">{trade.exit}</td>
                      <td className="px-4 py-3">{trade.lotSize}</td>
                      <td className={cn(
                        "px-4 py-3 font-medium",
                        trade.total > 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {trade.total > 0 ? '+' : ''}{trade.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {trade.hashtags.slice(0, 2).map((tag) => (
                            <HashtagBadge key={tag} tag={tag} size="sm" />
                          ))}
                          {trade.hashtags.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{trade.hashtags.length - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleViewTrade(trade.id)}
                            title="View trade details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleEditTrade(trade.id)}
                            title="Edit trade"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleDeleteTrade(trade.id)}
                            title="Delete trade"
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
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600 mb-2">No trades found</h3>
          <p className="text-gray-500 mb-6">
            {trades.length > 0 
              ? "Try changing your filters or search term"
              : "Start by adding your first trade"}
          </p>
          {trades.length === 0 && (
            <Button asChild>
              <Link to="/add-trade">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Trade
              </Link>
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={!!tradeToDelete} onOpenChange={(open) => !open && setTradeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trade
              and remove it from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Trades;
