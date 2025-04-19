import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AddPairDialog } from '@/components/AddPairDialog';
import { TradingView } from '@/components/TradingView';

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addTrade, updateTrade, getTrade, accounts, pairs, allHashtags, addHashtag, tradingAccounts, symbols } = useTrade();
  
  const [pair, setPair] = useState('');
  const [account, setAccount] = useState('');
  const [tradeDate, setTradeDate] = useState<string>('');
  const [type, setType] = useState('');
  const [entry, setEntry] = useState<number>(0);
  const [exit, setExit] = useState<number>(0);
  const [lotSize, setLotSize] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [marketSession, setMarketSession] = useState('');
  const [playbook, setPlaybook] = useState('');
  const [followedRules, setFollowedRules] = useState<string[]>([]);
  const [isAddPairDialogOpen, setIsAddPairDialogOpen] = useState(false);
  
  const [tradeData, setTradeData] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  
  useEffect(() => {
    const fetchTradeData = async () => {
      if (id) {
        try {
          const fetchedTrade = await getTrade(id);
          if (fetchedTrade) {
            setTradeData(fetchedTrade);
            
            // Set all form values from the fetched trade
            setPair(fetchedTrade.pair || fetchedTrade.symbol || '');
            setAccount(fetchedTrade.account || fetchedTrade.accountId || '');
            setTradeDate(fetchedTrade.date || (fetchedTrade.entryDate ? new Date(fetchedTrade.entryDate).toISOString().split('T')[0] : ''));
            setType(fetchedTrade.type || fetchedTrade.direction || '');
            setEntry(fetchedTrade.entry || fetchedTrade.entryPrice || 0);
            setExit(fetchedTrade.exit || fetchedTrade.exitPrice || 0);
            setLotSize(fetchedTrade.lotSize || fetchedTrade.quantity || 0);
            setStopLoss(fetchedTrade.stopLoss || 0);
            setTakeProfit(fetchedTrade.takeProfit || 0);
            setDuration(fetchedTrade.durationMinutes || 0);
            setFees(fetchedTrade.fees || 0);
            setNotes(fetchedTrade.notes || '');
            setHashtags(fetchedTrade.hashtags || fetchedTrade.tags || []);
            setRating(fetchedTrade.rating || 0);
            setMarketSession(fetchedTrade.marketSession || '');
            setPlaybook(fetchedTrade.playbook || '');
            setFollowedRules(fetchedTrade.followedRules || []);
          }
        } catch (error) {
          console.error('Error fetching trade:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTradeData();
  }, [id, getTrade]);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTrade = {
      symbol: pair,
      accountId: account,
      date: tradeDate,
      entryDate: new Date(tradeDate),
      direction: type,
      entryPrice: entry,
      exitPrice: exit,
      quantity: lotSize,
      stopLoss: stopLoss,
      takeProfit: takeProfit,
      durationMinutes: duration,
      fees: fees,
      notes: notes,
      tags: hashtags,
      rating: rating,
      marketSession: marketSession,
      playbook: playbook,
      followedRules: followedRules,
      pair: pair,
      account: account,
      type: type,
      entry: entry,
      exit: exit,
      lotSize: lotSize,
    };

    if (id) {
      try {
        await updateTrade(id, newTrade);
        toast({
          title: "Trade updated",
          description: "Your trade has been updated successfully",
        });
        navigate('/trades');
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update trade",
          variant: "destructive",
        });
      }
    } else {
      try {
        await addTrade(newTrade);
        toast({
          title: "Trade added",
          description: "Your new trade has been added successfully",
        });
        navigate('/trades');
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add trade",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddHashtag = () => {
    if (newHashtag.trim()) {
      addHashtag(newHashtag);
      setHashtags([...hashtags, newHashtag]);
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (hashtagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== hashtagToRemove));
  };

  const handlePairAdded = (newPair: string) => {
    setPair(newPair);
  };

  const handleOpenAddPairDialog = () => {
    setIsAddPairDialogOpen(true);
  };

  const handleCloseAddPairDialog = () => {
    setIsAddPairDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Trade' : 'Add Trade'}</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Column */}
        <div>
          <div className="mb-4">
            <Label htmlFor="pair">Trading Pair</Label>
            <div className="flex items-center">
              <Select value={pair} onValueChange={setPair}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a pair" />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map((symbol) => (
                    <SelectItem key={symbol.symbol} value={symbol.symbol}>
                      {symbol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="ml-2"
                onClick={handleOpenAddPairDialog}
              >
                +
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="account">Account</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label>Trade Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !tradeDate && "text-muted-foreground"
                  )}
                >
                  {tradeDate ? format(new Date(tradeDate), "PPP") : (
                    <span>Pick a date</span>
                  )}
                  {/* <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> */}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={tradeDate ? new Date(tradeDate) : undefined}
                  onSelect={(date) => setTradeDate(date?.toISOString().split('T')[0] || '')}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="mb-4">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select trade type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="entry">Entry Price</Label>
            <Input
              type="number"
              id="entry"
              value={entry}
              onChange={(e) => setEntry(parseFloat(e.target.value))}
              placeholder="Enter entry price"
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="exit">Exit Price</Label>
            <Input
              type="number"
              id="exit"
              value={exit}
              onChange={(e) => setExit(parseFloat(e.target.value))}
              placeholder="Enter exit price"
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="lotSize">Lot Size</Label>
            <Input
              type="number"
              id="lotSize"
              value={lotSize}
              onChange={(e) => setLotSize(parseFloat(e.target.value))}
              placeholder="Enter lot size"
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="stopLoss">Stop Loss</Label>
            <Input
              type="number"
              id="stopLoss"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              placeholder="Enter stop loss"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="takeProfit">Take Profit</Label>
            <Input
              type="number"
              id="takeProfit"
              value={takeProfit}
              onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
              placeholder="Enter take profit"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              placeholder="Enter duration in minutes"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="fees">Fees</Label>
            <Input
              type="number"
              id="fees"
              value={fees}
              onChange={(e) => setFees(parseFloat(e.target.value))}
              placeholder="Enter fees"
            />
          </div>
        </div>

        {/* Second Column */}
        <div>
          <div className="mb-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
              className="min-h-[100px]"
            />
          </div>

          <div className="mb-4">
            <Label>Hashtags</Label>
            <div className="flex items-center mb-2">
              <Input
                type="text"
                placeholder="Add a hashtag"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
              />
              <Button type="button" variant="outline" size="sm" className="ml-2" onClick={handleAddHashtag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="mr-1 mb-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 -mr-1 h-4 w-4"
                    onClick={() => handleRemoveHashtag(tag)}
                  >
                    {/* <X className="h-3 w-3" /> */}
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="rating">Rating</Label>
            <Input
              type="number"
              id="rating"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              placeholder="Enter rating"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="marketSession">Market Session</Label>
            <Input
              type="text"
              id="marketSession"
              value={marketSession}
              onChange={(e) => setMarketSession(e.target.value)}
              placeholder="Enter market session"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="playbook">Playbook</Label>
            <Input
              type="text"
              id="playbook"
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
              placeholder="Enter playbook"
            />
          </div>

          <div className="mb-4">
            <Label>Followed Rules</Label>
            <div>
              <Label htmlFor="rule1" className="inline-flex items-center space-x-2">
                <Checkbox
                  id="rule1"
                  checked={followedRules.includes('Rule 1')}
                  onCheckedChange={(checked) =>
                    setFollowedRules(
                      checked
                        ? [...followedRules, 'Rule 1']
                        : followedRules.filter((rule) => rule !== 'Rule 1')
                    )
                  }
                />
                <span>Rule 1</span>
              </Label>
            </div>
            <div>
              <Label htmlFor="rule2" className="inline-flex items-center space-x-2">
                <Checkbox
                  id="rule2"
                  checked={followedRules.includes('Rule 2')}
                  onCheckedChange={(checked) =>
                    setFollowedRules(
                      checked
                        ? [...followedRules, 'Rule 2']
                        : followedRules.filter((rule) => rule !== 'Rule 2')
                    )
                  }
                />
                <span>Rule 2</span>
              </Label>
            </div>
          </div>
        </div>

        <AddPairDialog
          isOpen={isAddPairDialogOpen}
          onClose={handleCloseAddPairDialog}
          onPairAdded={handlePairAdded}
        />
      </form>
      <Separator className="my-4" />
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/trades')}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          {id ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </div>
  );
};

export default AddTrade;
