
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, ArrowDownUp, Calendar } from 'lucide-react';
import { usePlaybooks, PlaybookEntry } from '@/hooks/usePlaybooks';
import PlaybookCard from './PlaybookCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlaybookFormData {
  name: string;
  description: string;
  tags: string[];
  category?: 'trend' | 'reversal' | 'breakout' | 'other';
}

const PlaybookTab = () => {
  const { toast } = useToast();
  const { playbooks, addPlaybook, updatePlaybook, deletePlaybook } = usePlaybooks();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<PlaybookFormData>();
  
  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  
  // Filtered and sorted playbooks
  const filteredPlaybooks = useMemo(() => {
    let filtered = [...playbooks];
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'profitability':
          return (b.expectedValue || 0) - (a.expectedValue || 0);
        case 'winRate':
          return (b.winRate || 0) - (a.winRate || 0);
        case 'usage':
          return (b.totalTrades || 0) - (a.totalTrades || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [playbooks, filterCategory, searchQuery, sortBy]);

  const onSubmit = async (data: PlaybookFormData) => {
    try {
      await addPlaybook({
        ...data,
        tags: data.tags || [],
        rating: 0,
        category: data.category || 'other'
      });
      
      toast({
        title: "Playbook Created",
        description: "Your new trading playbook has been created successfully"
      });
      
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create playbook",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trading Playbooks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Playbook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create New Playbook</DialogTitle>
                <DialogDescription>
                  Document your trading strategy and rules
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playbook Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Breakout Strategy"
                    {...register('name', { required: true })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue('category', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trend">Trend</SelectItem>
                      <SelectItem value="reversal">Reversal</SelectItem>
                      <SelectItem value="breakout">Breakout</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your trading strategy..."
                    {...register('description', { required: true })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Playbook</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Input
              className="pl-8 w-full sm:w-64"
              placeholder="Search playbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-2.5 top-2.5 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={filterCategory} onValueChange={setFilterCategory}>
                <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="trend">Trend</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="reversal">Reversal</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="breakout">Breakout</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={dateRange} onValueChange={setDateRange}>
                <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="week">Last 7 Days</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="month">This Month</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="quarter">Last 3 Months</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="year">This Year</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowDownUp className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                <DropdownMenuRadioItem value="name">By Name</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">By Rating</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="profitability">Most Profitable</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="winRate">Highest Win Rate</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="usage">Most Used</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Most Profitable Playbooks</h3>
            <ol className="space-y-1">
              {playbooks
                .sort((a, b) => (b.expectedValue || 0) - (a.expectedValue || 0))
                .slice(0, 3)
                .map((playbook, index) => (
                  <li key={playbook.id} className="text-sm flex justify-between">
                    <span>{index + 1}. {playbook.name}</span>
                    <span className="font-medium text-green-500">${playbook.averageProfit?.toFixed(2)}</span>
                  </li>
                ))}
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Highest Win Rate Playbooks</h3>
            <ol className="space-y-1">
              {playbooks
                .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
                .slice(0, 3)
                .map((playbook, index) => (
                  <li key={playbook.id} className="text-sm flex justify-between">
                    <span>{index + 1}. {playbook.name}</span>
                    <span className="font-medium">{playbook.winRate}%</span>
                  </li>
                ))}
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Most Used Playbooks</h3>
            <ol className="space-y-1">
              {playbooks
                .sort((a, b) => (b.totalTrades || 0) - (a.totalTrades || 0))
                .slice(0, 3)
                .map((playbook, index) => (
                  <li key={playbook.id} className="text-sm flex justify-between">
                    <span>{index + 1}. {playbook.name}</span>
                    <span className="font-medium">{playbook.totalTrades} trades</span>
                  </li>
                ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Playbook Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaybooks.map((playbook) => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            onEdit={(updatedData) => updatePlaybook(playbook.id, updatedData)}
            onDelete={() => deletePlaybook(playbook.id)}
          />
        ))}
        
        {filteredPlaybooks.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No playbooks found matching your criteria. Try adjusting your filters or create a new playbook.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybookTab;
