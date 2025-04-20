import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, Filter, ArrowDownUp, Calendar, Lock, Unlock, 
  BookOpen, Users, Star, TrendingUp, BarChart4, Percent, Coins
} from 'lucide-react';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { PlaybookEntry, PlaybookRule } from '@/types/settings';
import PlaybookCard from './PlaybookCard';
import { useToast } from '@/hooks/use-toast';

interface PlaybookFormData {
  name: string;
  description: string;
  tags: string[];
  category?: 'trend' | 'reversal' | 'breakout' | 'other';
  isPrivate?: boolean;
  entryRules?: string[];
  exitRules?: string[];
  riskRules?: string[];
  customRules?: string[];
}

const PlaybookTab = () => {
  const { toast } = useToast();
  const { playbooks, addPlaybook, updatePlaybook, deletePlaybook } = usePlaybooks();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState<string>('my-playbooks');
  const { register, handleSubmit, reset, control, setValue, watch } = useForm<PlaybookFormData>({
    defaultValues: {
      isPrivate: false,
      entryRules: [''],
      exitRules: [''],
      riskRules: [''],
      customRules: ['']
    }
  });
  
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showPrivate, setShowPrivate] = useState<boolean>(true);
  const [showShared, setShowShared] = useState<boolean>(true);
  
  const entryRules = watch('entryRules');
  const exitRules = watch('exitRules');
  const riskRules = watch('riskRules');
  const customRules = watch('customRules');
  
  const filteredPlaybooks = useMemo(() => {
    let filtered = [...playbooks];
    
    if (activeTab === 'my-playbooks') {
      if (!showPrivate) {
        filtered = filtered.filter(p => !p.isPrivate);
      }
      if (!showShared) {
        filtered = filtered.filter(p => p.isPrivate);
      }
    } else {
      filtered = filtered.filter(p => !p.isPrivate);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'profitability':
          return (b.netProfitLoss || 0) - (a.netProfitLoss || 0);
        case 'winRate':
          return (b.winRate || 0) - (a.winRate || 0);
        case 'usage':
          return (b.totalTrades || 0) - (a.totalTrades || 0);
        case 'expectancy':
          return (b.expectedValue || 0) - (a.expectedValue || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [playbooks, filterCategory, searchQuery, sortBy, activeTab, showPrivate, showShared]);

  const addRuleField = (type: 'entryRules' | 'exitRules' | 'riskRules' | 'customRules') => {
    const currentRules = watch(type) || [];
    setValue(type, [...currentRules, '']);
  };

  const removeRuleField = (type: 'entryRules' | 'exitRules' | 'riskRules' | 'customRules', index: number) => {
    const currentRules = watch(type) || [];
    setValue(type, currentRules.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PlaybookFormData) => {
    try {
      const rules: PlaybookRule[] = [];
      let ruleOrder = 0;
      
      if (data.entryRules) {
        data.entryRules.forEach((rule, index) => {
          if (rule.trim()) {
            rules.push({
              id: `entry-${Date.now()}-${index}`,
              type: 'entry',
              description: rule.trim(),
              order: ruleOrder++
            });
          }
        });
      }
      
      if (data.exitRules) {
        data.exitRules.forEach((rule, index) => {
          if (rule.trim()) {
            rules.push({
              id: `exit-${Date.now()}-${index}`,
              type: 'exit',
              description: rule.trim(),
              order: ruleOrder++
            });
          }
        });
      }
      
      if (data.riskRules) {
        data.riskRules.forEach((rule, index) => {
          if (rule.trim()) {
            rules.push({
              id: `risk-${Date.now()}-${index}`,
              type: 'risk',
              description: rule.trim(),
              order: ruleOrder++
            });
          }
        });
      }
      
      if (data.customRules) {
        data.customRules.forEach((rule, index) => {
          if (rule.trim()) {
            rules.push({
              id: `custom-${Date.now()}-${index}`,
              type: 'custom',
              description: rule.trim(),
              order: ruleOrder++
            });
          }
        });
      }
      
      const newPlaybook: Omit<PlaybookEntry, 'id'> = {
        name: data.name,
        description: data.description,
        tags: data.tags || [],
        rating: 0,
        category: data.category || 'other',
        isPrivate: data.isPrivate || false,
        rules: rules,
        setup: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'current-user',
        order: 0,
        tradeType: 'both',
        rMultiple: 0,
        winRate: 0,
        expectedValue: 0,
        profitFactor: 0,
        netProfitLoss: 0,
        totalTrades: 0,
        avgWinner: 0,
        avgLoser: 0,
        missedTrades: 0
      };
      
      await addPlaybook(newPlaybook);
      
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Trading Playbooks</h2>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Playbook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Create New Playbook</DialogTitle>
                  <DialogDescription>
                    Document your trading strategy, rules, and performance metrics
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your trading strategy..."
                      {...register('description', { required: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., momentum, breakout, volume"
                      {...register('tags')}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isPrivate"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="is-private"
                        />
                      )}
                    />
                    <Label htmlFor="is-private" className="flex items-center">
                      {watch('isPrivate') ? (
                        <>
                          <Lock className="h-4 w-4 mr-1" /> Private Playbook
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-1" /> Shared Playbook
                        </>
                      )}
                    </Label>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Playbook Rules</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Entry Rules</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => addRuleField('entryRules')}
                        >
                          Add Rule
                        </Button>
                      </div>
                      {entryRules?.map((_, index) => (
                        <div key={`entry-${index}`} className="flex gap-2">
                          <Input
                            {...register(`entryRules.${index}`)}
                            placeholder="e.g., Wait for price to break above resistance"
                          />
                          {index > 0 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeRuleField('entryRules', index)}
                              className="h-10 px-2"
                            >
                              &times;
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Exit Rules</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => addRuleField('exitRules')}
                        >
                          Add Rule
                        </Button>
                      </div>
                      {exitRules?.map((_, index) => (
                        <div key={`exit-${index}`} className="flex gap-2">
                          <Input
                            {...register(`exitRules.${index}`)}
                            placeholder="e.g., Take profit at previous swing high"
                          />
                          {index > 0 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeRuleField('exitRules', index)}
                              className="h-10 px-2"
                            >
                              &times;
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Risk Management Rules</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => addRuleField('riskRules')}
                        >
                          Add Rule
                        </Button>
                      </div>
                      {riskRules?.map((_, index) => (
                        <div key={`risk-${index}`} className="flex gap-2">
                          <Input
                            {...register(`riskRules.${index}`)}
                            placeholder="e.g., Risk no more than 1% of account per trade"
                          />
                          {index > 0 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeRuleField('riskRules', index)}
                              className="h-10 px-2"
                            >
                              &times;
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Custom Rules</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => addRuleField('customRules')}
                        >
                          Add Rule
                        </Button>
                      </div>
                      {customRules?.map((_, index) => (
                        <div key={`custom-${index}`} className="flex gap-2">
                          <Input
                            {...register(`customRules.${index}`)}
                            placeholder="e.g., Check market sentiment before entry"
                          />
                          {index > 0 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeRuleField('customRules', index)}
                              className="h-10 px-2"
                            >
                              &times;
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
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
      </div>

      <Tabs defaultValue="my-playbooks" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="my-playbooks" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" /> My Playbooks
          </TabsTrigger>
          <TabsTrigger value="shared-playbooks" className="flex items-center">
            <Users className="h-4 w-4 mr-2" /> Shared Playbooks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-playbooks" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={showPrivate ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowPrivate(!showPrivate)}
              className="flex items-center"
            >
              <Lock className="h-4 w-4 mr-1" /> Private
            </Button>
            <Button 
              variant={showShared ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowShared(!showShared)}
              className="flex items-center"
            >
              <Unlock className="h-4 w-4 mr-1" /> Shared
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
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
                    <DropdownMenuRadioItem value="expectancy">Best Expectancy</DropdownMenuRadioItem>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <Coins className="h-4 w-4 mr-1" /> Most Profitable Playbooks
                </h3>
                <ol className="space-y-1">
                  {playbooks
                    .sort((a, b) => (b.netProfitLoss || 0) - (a.netProfitLoss || 0))
                    .slice(0, 3)
                    .map((playbook, index) => (
                      <li key={playbook.id} className="text-sm flex justify-between">
                        <span>{index + 1}. {playbook.name}</span>
                        <span className="font-medium text-green-500">${playbook.netProfitLoss?.toFixed(2) || '0.00'}</span>
                      </li>
                    ))}
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <Percent className="h-4 w-4 mr-1" /> Highest Win Rate Playbooks
                </h3>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" /> Best Expectancy Playbooks
                </h3>
                <ol className="space-y-1">
                  {playbooks
                    .sort((a, b) => (b.expectedValue || 0) - (a.expectedValue || 0))
                    .slice(0, 3)
                    .map((playbook, index) => (
                      <li key={playbook.id} className="text-sm flex justify-between">
                        <span>{index + 1}. {playbook.name}</span>
                        <span className="font-medium">{playbook.expectedValue}</span>
                      </li>
                    ))}
                </ol>
              </CardContent>
            </Card>
          </div>

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
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No playbooks found matching your criteria. Try adjusting your filters or create a new playbook.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="shared-playbooks" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaybooks.map((playbook) => (
              <PlaybookCard
                key={playbook.id}
                playbook={playbook}
                onViewDetails={() => {}}
              />
            ))}
            
            {filteredPlaybooks.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No shared playbooks found. Either no one has shared their playbooks yet or try adjusting your filters.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlaybookTab;
