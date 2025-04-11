
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import TradeCard from '@/components/TradeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Trades: React.FC = () => {
  const { trades, deleteTrade, pairs } = useTrade();
  const [searchTerm, setSearchTerm] = useState('');
  const [pairFilter, setPairFilter] = useState('all');
  const [tradeTypeFilter, setTradeTypeFilter] = useState('all');
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = searchTerm === '' || 
      trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) || 
      trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPair = pairFilter === 'all' || trade.pair === pairFilter;
    const matchesType = tradeTypeFilter === 'all' || trade.type === tradeTypeFilter;
    
    return matchesSearch && matchesPair && matchesType;
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
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPairFilter('all');
    setTradeTypeFilter('all');
  };

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Your Trades</h1>
          <p className="text-gray-500">
            {sortedTrades.length} trade{sortedTrades.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button asChild>
          <Link to="/add-trade">
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </Link>
        </Button>
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

      {sortedTrades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrades.map(trade => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onEdit={handleEditTrade}
              onDelete={handleDeleteTrade}
            />
          ))}
        </div>
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
