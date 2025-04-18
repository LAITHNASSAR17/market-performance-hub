import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, X } from "lucide-react";
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import StarRating from '@/components/StarRating';
import { supabase } from '@/lib/supabase';
import AddPairDialog from '@/components/AddPairDialog';
import ImageUpload from '@/components/ImageUpload';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import TagSelectors from '@/components/analytics/TagSelectors';
import { useTagsState } from '@/hooks/useTagsState';
import TradingSessionSelector from '@/components/TradingSessionSelector';

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrade, updateTrade, addTrade, pairs, accounts, allHashtags, addHashtag } = useTrade();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPairDialog, setShowAddPairDialog] = useState(false);
  const { playbooks } = usePlaybooks();
  const { mistakes, setups, habits } = useTagsState();
  
  const [pair, setPair] = useState('');
  const [type, setType] = useState<'Buy' | 'Sell'>('Buy');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [durationMinutes, setDurationMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [account, setAccount] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [profitLoss, setProfitLoss] = useState<string>('0');
  const [commission, setCommission] = useState('0');
  const [rating, setRating] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [total, setTotal] = useState<string>('0');
  const [playbook, setPlaybook] = useState<string | undefined>(undefined);
  const [followedRules, setFollowedRules] = useState<string[]>([]);
  const [marketSession, setMarketSession] = useState<string | undefined>(undefined);

  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [selectedSetups, setSelectedSetups] = useState<string[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  const fetchTradeFromDb = async (tradeId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setPair(data.symbol || '');
        setType(data.direction === 'long' ? 'Buy' : 'Sell');
        setEntry(data.entry_price?.toString() || '');
        setExit(data.exit_price?.toString() || '');
        setLotSize(data.quantity?.toString() || '');
        
        if (data.entry_date) {
          setDate(data.entry_date.split('T')[0]);
        }
        
        setStopLoss(data.stop_loss?.toString() || '');
        setTakeProfit(data.take_profit?.toString() || '');
        setDurationMinutes(data.duration_minutes?.toString() || '');
        setNotes(data.notes || '');
        setHashtags(data.tags || []);
        setProfitLoss(data.profit_loss?.toString() || '0');
        setCommission(data.fees?.toString() || '0');
        setRating(data.rating || 0);
        setImageUrl(data.image_url || null);
        setBeforeImageUrl(data.before_image_url || null);
        setAfterImageUrl(data.after_image_url || null);
        setPlaybook(data.playbook || undefined);
        setFollowedRules(data.followed_rules || []);
        setMarketSession(data.market_session || undefined);
        
        const tags = data.tags || [];
        setSelectedMistakes(tags.filter((tag: string) => mistakes.includes(tag)));
        setSelectedSetups(tags.filter((tag: string) => setups.includes(tag)));
        setSelectedHabits(tags.filter((tag: string) => habits.includes(tag)));
        
        setAccount(accounts[0] || '');
        setIsEditing(true);
        console.log("Trade data loaded:", data);
      }
    } catch (error) {
      console.error('Error fetching trade:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching trade data",
        variant: "destructive"
      });
      navigate('/trades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTradeFromDb(id);
    } else {
      setAccount(accounts[0] || '');
    }
  }, [id, accounts]);

  const handleAddHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag]);
      addHashtag(newHashtag);
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCommission = e.target.value;
    setCommission(newCommission);
    
    const rawPL = parseFloat(profitLoss) || 0;
    const fees = parseFloat(newCommission) || 0;
    setTotal((rawPL - fees).toString());
  };

  const handleProfitLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPL = e.target.value;
    setProfitLoss(newPL);
    
    const rawPL = parseFloat(newPL) || 0;
    const fees = parseFloat(commission) || 0;
    setTotal((rawPL - fees).toString());
  };

  const handlePlaybookChange = (value: string) => {
    setPlaybook(value);
    setFollowedRules([]);
  };

  const toggleRuleSelection = (ruleText: string) => {
    if (followedRules.includes(ruleText)) {
      setFollowedRules(followedRules.filter(rule => rule !== ruleText));
    } else {
      setFollowedRules([...followedRules, ruleText]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pair || !type || !entry || !date || !account) {
      toast({
        title: "Missing Data",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const tradeData = {
        pair,
        type,
        entry: parseFloat(entry),
        exit: exit ? parseFloat(exit) : null,
        lotSize: parseFloat(lotSize),
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        date,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : 0,
        notes,
        account,
        hashtags: [...hashtags, ...selectedMistakes, ...selectedSetups, ...selectedHabits],
        profitLoss: parseFloat(profitLoss),
        commission: parseFloat(commission) || 0,
        total: parseFloat(total),
        rating,
        riskPercentage: 0,
        returnPercentage: 0,
        imageUrl: imageUrl,
        beforeImageUrl: beforeImageUrl,
        afterImageUrl: afterImageUrl,
        playbook,
        followedRules,
        marketSession
      };

      if (isEditing && id) {
        await updateTrade(id, tradeData);
        toast({
          title: "Updated",
          description: "Trade updated successfully",
        });
      } else {
        await addTrade(tradeData);
        toast({
          title: "Added",
          description: "Trade added successfully",
        });
      }
      
      navigate('/trades');
    } catch (error) {
      console.error('Error saving trade:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the trade",
        variant: "destructive"
      });
    }
  };

  const selectedPlaybookRules = playbook 
    ? playbooks.find(p => p.id === playbook)?.rules || []
    : [];

  return (
    <Layout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Trade' : 'Add New Trade'}</h1>
        <p className="text-gray-500">
          {isEditing 
            ? 'Update your trade details' 
            : 'Record a new trade with all relevant details'}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading trade data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trade Details</CardTitle>
                <CardDescription>Enter the basic information about your trade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pair">Trading Pair/Symbol</Label>
                    {isEditing ? (
                      <Input 
                        id="pair" 
                        value={pair} 
                        readOnly 
                        className="bg-gray-100 border border-gray-300"
                      />
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select value={pair} onValueChange={setPair} required>
                            <SelectTrigger id="pair">
                              <SelectValue placeholder="Select pair" />
                            </SelectTrigger>
                            <SelectContent>
                              {pairs.map(p => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                              <SelectItem value="add-new" className="text-primary font-semibold">
                                + Add new pair
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="px-3" 
                          onClick={() => setShowAddPairDialog(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account">Trading Account</Label>
                    <Select value={account} onValueChange={setAccount} required>
                      <SelectTrigger id="account">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <TradingSessionSelector 
                    value={marketSession} 
                    onValueChange={setMarketSession} 
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Trade Type</Label>
                    <Select value={type} onValueChange={(value: 'Buy' | 'Sell') => setType(value)} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">Buy (Long)</SelectItem>
                        <SelectItem value="Sell">Sell (Short)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Trade Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        id="date" 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playbook">Playbook</Label>
                    <Select 
                      value={playbook} 
                      onValueChange={handlePlaybookChange}
                    >
                      <SelectTrigger id="playbook">
                        <SelectValue placeholder="Select playbook (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {playbooks.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {playbook && playbook !== 'none' && selectedPlaybookRules.length > 0 && (
                  <div className="mt-4 border rounded-md p-4 bg-muted/30">
                    <h3 className="font-medium mb-2">Followed Playbook Rules:</h3>
                    <div className="space-y-2">
                      {selectedPlaybookRules.map((rule: any) => (
                        <div key={rule.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`rule-${rule.id}`}
                            checked={followedRules.includes(rule.description)}
                            onChange={() => toggleRuleSelection(rule.description)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`rule-${rule.id}`} className="text-sm">
                            {rule.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Price Information</CardTitle>
                <CardDescription>Enter entry, exit prices and risk management details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="entry">Entry Price</Label>
                    <Input 
                      id="entry" 
                      type="number" 
                      step="any" 
                      value={entry} 
                      onChange={(e) => setEntry(e.target.value)} 
                      required
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exit">Exit Price</Label>
                    <Input 
                      id="exit" 
                      type="number" 
                      step="any" 
                      value={exit} 
                      onChange={(e) => setExit(e.target.value)} 
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">Position Size</Label>
                    <Input 
                      id="lotSize" 
                      type="number" 
                      step="any" 
                      value={lotSize} 
                      onChange={(e) => setLotSize(e.target.value)} 
                      required
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input 
                      id="stopLoss" 
                      type="number" 
                      step="any" 
                      value={stopLoss} 
                      onChange={(e) => setStopLoss(e.target.value)} 
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">Take Profit</Label>
                    <Input 
                      id="takeProfit" 
                      type="number" 
                      step="any" 
                      value={takeProfit} 
                      onChange={(e) => setTakeProfit(e.target.value)} 
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profitLoss">Profit/Loss</Label>
                    <Input 
                      id="profitLoss" 
                      type="number" 
                      step="any" 
                      value={profitLoss} 
                      onChange={handleProfitLossChange}
                      required
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                    <Input 
                      id="durationMinutes" 
                      type="number" 
                      value={durationMinutes} 
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission/Fees</Label>
                    <Input 
                      id="commission" 
                      type="number" 
                      step="any" 
                      value={commission} 
                      onChange={handleCommissionChange}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total">Total (Net P/L)</Label>
                    <Input 
                      id="total" 
                      type="number" 
                      value={total}
                      readOnly
                      className="bg-gray-100 border border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trade Images</CardTitle>
                <CardDescription>Add images for trade setup, entry and exit</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Pre-Entry Image</Label>
                    <ImageUpload 
                      value={beforeImageUrl} 
                      onChange={setBeforeImageUrl}
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Post-Exit Image</Label>
                    <ImageUpload 
                      value={afterImageUrl} 
                      onChange={setAfterImageUrl}
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Additional Image</Label>
                    <ImageUpload 
                      value={imageUrl} 
                      onChange={setImageUrl}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trade Rating</CardTitle>
                <CardDescription>Rate the execution quality of this trade</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">How would you rate this trade?</p>
                  <StarRating 
                    value={rating} 
                    onChange={setRating}
                    size="large"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trade Categories</CardTitle>
                <CardDescription>Categorize your trade with predefined tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <TagSelectors
                  mistakes={mistakes}
                  setups={setups}
                  habits={habits}
                  selectedMistakes={selectedMistakes}
                  selectedSetups={selectedSetups}
                  selectedHabits={selectedHabits}
                  onAddMistake={(tag) => setSelectedMistakes([...selectedMistakes, tag])}
                  onAddSetup={(tag) => setSelectedSetups([...selectedSetups, tag])}
                  onAddHabit={(tag) => setSelectedHabits([...selectedHabits, tag])}
                  onRemoveMistake={(tag) => setSelectedMistakes(selectedMistakes.filter(t => t !== tag))}
                  onRemoveSetup={(tag) => setSelectedSetups(selectedSetups.filter(t => t !== tag))}
                  onRemoveHabit={(tag) => setSelectedHabits(selectedHabits.filter(t => t !== tag))}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notes & Tags</CardTitle>
                <CardDescription>Add notes and categorize your trade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Trade Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Add notes about your trade, strategy used, observations..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {hashtags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 hover:bg-transparent" 
                          onClick={() => handleRemoveHashtag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a tag..." 
                      value={newHashtag} 
                      onChange={(e) => setNewHashtag(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddHashtag} 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Suggested tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {allHashtags.slice(0, 10).map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => {
                            if (!hashtags.includes(tag)) {
                              setHashtags([...hashtags, tag]);
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-4 mb-10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/trades')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
            >
              {isEditing ? 'Update Trade' : 'Add Trade'}
            </Button>
          </div>
        </form>
      )}
      
      <AddPairDialog 
        isOpen={showAddPairDialog}
        onClose={() => setShowAddPairDialog(false)}
        onPairAdded={(newSymbol) => {
          setPair(newSymbol);
          setShowAddPairDialog(false);
        }}
      />
    </Layout>
  );
};

export default AddTrade;
