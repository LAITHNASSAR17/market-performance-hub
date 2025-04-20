import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/hooks/use-toast';
import { Trade } from '@/types/trade';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckCircle, CircleX, TrendingDown, TrendingUp, Clock, Tag, ImagePlus, Image } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useForm, Controller } from 'react-hook-form';
import { Switch } from "@/components/ui/switch";
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { PlaybookEntry } from '@/types/settings';
import HashtagInput from '@/components/HashtagInput';

interface TradeFormValues {
  pair: string;
  type: 'Buy' | 'Sell';
  entry: number;
  exit: number;
  lotSize: number;
  stopLoss: number;
  takeProfit: number;
  date: string;
  durationMinutes: number;
  notes: string;
  account: string;
  hashtags: string[];
  imageUrl: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  commission: number;
  rating: number;
  playbook: string;
  followedRules: string[];
  marketSession: string;
}

const AddTrade: React.FC = () => {
  const { addTrade, updateTrade, getTrade, pairs, accounts, addSymbol } = useTrade();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id: tradeId } = useParams<{ id: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const [returnPercent, setReturnPercent] = useState(0);
  const [riskPercent, setRiskPercent] = useState(0);
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 0),
  })
  const { playbooks } = usePlaybooks();
  const [formState, setFormState] = useState<Partial<TradeFormValues>>({
    pair: '',
    type: 'Buy',
    entry: 0,
    exit: 0,
    lotSize: 0,
    stopLoss: 0,
    takeProfit: 0,
    date: new Date().toISOString().split('T')[0],
    durationMinutes: 0,
    notes: '',
    account: 'Demo',
    hashtags: [],
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    commission: 0,
    rating: 0,
    playbook: '',
    followedRules: [],
    marketSession: 'Asia'
  });

  useEffect(() => {
    if (tradeId) {
      const existingTrade = getTrade(tradeId);
      if (existingTrade) {
        setFormState({
          pair: existingTrade.pair,
          type: existingTrade.type,
          entry: existingTrade.entry,
          exit: existingTrade.exit,
          lotSize: existingTrade.lotSize,
          stopLoss: existingTrade.stopLoss,
          takeProfit: existingTrade.takeProfit,
          date: existingTrade.date,
          durationMinutes: existingTrade.durationMinutes,
          notes: existingTrade.notes,
          account: existingTrade.account,
          hashtags: existingTrade.hashtags,
          imageUrl: existingTrade.imageUrl,
          beforeImageUrl: existingTrade.beforeImageUrl,
          afterImageUrl: existingTrade.afterImageUrl,
          commission: existingTrade.commission,
          rating: existingTrade.rating,
          playbook: existingTrade.playbook,
          followedRules: existingTrade.followedRules,
          marketSession: existingTrade.marketSession
        });
      }
    }
  }, [tradeId, getTrade]);

  useEffect(() => {
    // Calculate profit, return, and risk percentages whenever entry/exit changes
    if (formState.entry && formState.exit && formState.lotSize) {
      const profit = (formState.type === 'Buy' ? 1 : -1) * (formState.exit - formState.entry) * formState.lotSize;
      setTotalProfit(profit);

      const returnPercentage = ((formState.exit - formState.entry) / formState.entry) * 100;
      setReturnPercent(returnPercentage);

      const riskPercentage = (formState.stopLoss && formState.entry) ? ((formState.entry - formState.stopLoss) / formState.entry) * 100 : 0;
      setRiskPercent(riskPercentage);
    }
  }, [formState.entry, formState.exit, formState.lotSize, formState.type, formState.stopLoss]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNumberChange = (name: string, value: number) => {
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveTrade = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!formState.pair || !formState.type || !formState.entry || !formState.exit || !formState.lotSize || !formState.date) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Basic validation for numbers
      if (formState.entry <= 0 || formState.exit <= 0 || formState.lotSize <= 0) {
        toast({
          title: "Error",
          description: "Entry, Exit, and Lot Size must be greater than zero.",
          variant: "destructive"
        });
        return;
      }

      // Now when creating the trade object to save, add the userId property
      const tradeToSave = {
        pair: formState.pair,
        type: formState.type as 'Buy' | 'Sell',
        entry: formState.entry,
        exit: formState.exit,
        lotSize: formState.lotSize,
        stopLoss: formState.stopLoss,
        takeProfit: formState.takeProfit,
        date: formState.date,
        durationMinutes: formState.durationMinutes,
        notes: formState.notes,
        account: formState.account,
        hashtags: formState.hashtags,
        imageUrl: formState.imageUrl,
        beforeImageUrl: formState.beforeImageUrl,
        afterImageUrl: formState.afterImageUrl,
        profitLoss: totalProfit,
        returnPercentage: returnPercent,
        riskPercentage: riskPercent,
        commission: formState.commission,
        rating: formState.rating,
        total: totalProfit - (formState.commission || 0),
        playbook: formState.playbook,
        followedRules: formState.followedRules,
        marketSession: formState.marketSession,
        // Add this line to include userId
        userId: 'current-user' // This will be replaced with the actual user ID by the backend
      };

      if (tradeId) {
        await updateTrade(tradeId, tradeToSave);
        toast({
          title: "Success",
          description: "Trade updated successfully",
        });
      } else {
        await addTrade(tradeToSave);
        toast({
          title: "Success",
          description: "Trade added successfully",
        });
      }

      navigate('/trades');
    } catch (error) {
      console.error('Error saving trade:', error);
      toast({
        title: "Error",
        description: "Failed to save trade",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPair = () => {
    const newPair = prompt("Enter the new pair/symbol:");
    if (newPair) {
      addSymbol(newPair);
      setFormState(prevState => ({
        ...prevState,
        pair: newPair
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{tradeId ? 'Edit Trade' : 'Add Trade'}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pair">Pair / Symbol</Label>
                  <div className="flex items-center space-x-2">
                    <Select value={formState.pair} onValueChange={(value) => handleSelectChange('pair', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a pair" />
                      </SelectTrigger>
                      <SelectContent>
                        {pairs.map(pair => (
                          <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPair}>
                      Add Pair
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formState.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select trade type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="entry">Entry Price</Label>
                  <Input
                    type="number"
                    id="entry"
                    name="entry"
                    value={formState.entry || ''}
                    onChange={(e) => handleNumberChange('entry', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="exit">Exit Price</Label>
                  <Input
                    type="number"
                    id="exit"
                    name="exit"
                    value={formState.exit || ''}
                    onChange={(e) => handleNumberChange('exit', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="lotSize">Lot Size</Label>
                  <Input
                    type="number"
                    id="lotSize"
                    name="lotSize"
                    value={formState.lotSize || ''}
                    onChange={(e) => handleNumberChange('lotSize', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stopLoss">Stop Loss</Label>
                  <Input
                    type="number"
                    id="stopLoss"
                    name="stopLoss"
                    value={formState.stopLoss || ''}
                    onChange={(e) => handleNumberChange('stopLoss', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="takeProfit">Take Profit</Label>
                  <Input
                    type="number"
                    id="takeProfit"
                    name="takeProfit"
                    value={formState.takeProfit || ''}
                    onChange={(e) => handleNumberChange('takeProfit', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Commission</Label>
                  <Input
                    type="number"
                    id="commission"
                    name="commission"
                    value={formState.commission || ''}
                    onChange={(e) => handleNumberChange('commission', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      pagedNavigation
                      className="border-0"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                  <Input
                    type="number"
                    id="durationMinutes"
                    name="durationMinutes"
                    value={formState.durationMinutes || ''}
                    onChange={(e) => handleNumberChange('durationMinutes', parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account</Label>
                  <Select value={formState.account} onValueChange={(value) => handleSelectChange('account', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account} value={account}>{account}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formState.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Trade notes..."
                />
              </div>

              <div>
                <Label htmlFor="hashtags">Hashtags</Label>
                <HashtagInput
                  id="hashtags"
                  value={formState.hashtags || []}
                  onChange={(tags) => setFormState(prevState => ({ ...prevState, hashtags: tags }))}
                  suggestions={[]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formState.imageUrl || ''}
                    onChange={handleInputChange}
                    placeholder="Image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="beforeImageUrl">Before Image URL</Label>
                  <Input
                    type="text"
                    id="beforeImageUrl"
                    name="beforeImageUrl"
                    value={formState.beforeImageUrl || ''}
                    onChange={handleInputChange}
                    placeholder="Before Image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="afterImageUrl">After Image URL</Label>
                  <Input
                    type="text"
                    id="afterImageUrl"
                    name="afterImageUrl"
                    value={formState.afterImageUrl || ''}
                    onChange={handleInputChange}
                    placeholder="After Image URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    type="number"
                    id="rating"
                    name="rating"
                    value={formState.rating || ''}
                    onChange={(e) => handleNumberChange('rating', parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="playbook">Playbook</Label>
                  <Select value={formState.playbook} onValueChange={(value) => handleSelectChange('playbook', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select playbook" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {playbooks.map(playbook => (
                        <SelectItem key={playbook.id} value={playbook.id}>{playbook.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marketSession">Market Session</Label>
                  <Select value={formState.marketSession} onValueChange={(value) => handleSelectChange('marketSession', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="London">London</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Total Profit</Label>
                  <Input type="text" value={totalProfit.toFixed(2)} readOnly />
                </div>
                <div>
                  <Label>Return (%)</Label>
                  <Input type="text" value={returnPercent.toFixed(2)} readOnly />
                </div>
                <div>
                  <Label>Risk (%)</Label>
                  <Input type="text" value={riskPercent.toFixed(2)} readOnly />
                </div>
              </div>

              <Button disabled={isSaving} onClick={handleSaveTrade}>
                {isSaving ? 'Saving...' : 'Save Trade'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTrade;
