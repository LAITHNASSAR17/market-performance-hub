
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, X } from "lucide-react";
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import StarRating from '@/components/StarRating';

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrade, updateTrade, addTrade, pairs, accounts, allHashtags, addHashtag, calculateProfitLoss } = useTrade();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  
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
  const [account, setAccount] = useState(accounts[0] || '');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [profitLoss, setProfitLoss] = useState(0);
  const [commission, setCommission] = useState('0');
  const [rating, setRating] = useState(0);
  
  // Load trade data if editing
  useEffect(() => {
    if (id) {
      const trade = getTrade(id);
      if (trade) {
        setPair(trade.pair);
        setType(trade.type);
        setEntry(trade.entry.toString());
        setExit(trade.exit.toString());
        setLotSize(trade.lotSize.toString());
        setStopLoss(trade.stopLoss ? trade.stopLoss.toString() : '');
        setTakeProfit(trade.takeProfit ? trade.takeProfit.toString() : '');
        setDate(trade.date);
        setDurationMinutes(trade.durationMinutes.toString());
        setNotes(trade.notes);
        setAccount(trade.account);
        setHashtags(trade.hashtags);
        setProfitLoss(trade.profitLoss);
        setCommission(trade.commission.toString());
        setRating(trade.rating || 0);
        setIsEditing(true);
      } else {
        // Trade not found, redirect to trades list
        toast({
          title: "Trade not found",
          description: "The trade you're trying to edit doesn't exist",
          variant: "destructive"
        });
        navigate('/trades');
      }
    }
  }, [id, getTrade, navigate, toast]);

  // Calculate profit/loss when relevant fields change
  useEffect(() => {
    if (entry && exit && lotSize && type) {
      const calculatedPL = calculateProfitLoss(
        parseFloat(entry),
        parseFloat(exit),
        parseFloat(lotSize),
        type,
        pair
      );
      setProfitLoss(calculatedPL);
    }
  }, [entry, exit, lotSize, type, pair, calculateProfitLoss]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!pair || !type || !entry || !exit || !lotSize || !date || !account) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const tradeData = {
      pair,
      type,
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      lotSize: parseFloat(lotSize),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      date,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : 0,
      notes,
      account,
      hashtags,
      profitLoss,
      riskPercentage: 0, // Calculate or add input
      returnPercentage: 0, // Calculate or add input
      imageUrl: null,
      beforeImageUrl: null,
      afterImageUrl: null,
      commission: parseFloat(commission) || 0,
      rating
    };

    if (isEditing && id) {
      updateTrade(id, tradeData);
      toast({
        title: "Trade updated",
        description: "Your trade has been updated successfully",
      });
    } else {
      addTrade(tradeData);
      toast({
        title: "Trade added",
        description: "Your trade has been added successfully",
      });
    }
    
    navigate('/trades');
  };

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
            ? 'Update the details of your existing trade' 
            : 'Record a new trade with all relevant details'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          <Card className="border-[#9b87f5]/30 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#f1f0fb]/50 to-transparent">
              <CardTitle className="text-lg text-[#1A1F2C] flex items-center">Trade Details</CardTitle>
              <CardDescription>Enter the basic information about your trade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="pair" className="text-[#1A1F2C]">Trading Pair/Symbol</Label>
                  <Select value={pair} onValueChange={setPair} required disabled={isEditing}>
                    <SelectTrigger id="pair" className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/30">
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {pairs.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account" className="text-[#1A1F2C]">Trading Account</Label>
                  <Select value={account} onValueChange={setAccount} required disabled={isEditing}>
                    <SelectTrigger id="account" className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/30">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-[#1A1F2C]">Trade Type</Label>
                  <Select value={type} onValueChange={(value: 'Buy' | 'Sell') => setType(value)} required disabled={isEditing}>
                    <SelectTrigger id="type" className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/30">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buy">Buy (Long)</SelectItem>
                      <SelectItem value="Sell">Sell (Short)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[#1A1F2C]">Trade Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7E69AB]" />
                    <Input 
                      id="date" 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="pl-9 border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                      required
                      disabled={isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#9b87f5]/30 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#f1f0fb]/50 to-transparent">
              <CardTitle className="text-lg text-[#1A1F2C] flex items-center">Price Information</CardTitle>
              <CardDescription>Enter the entry, exit, and risk management details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="entry" className="text-[#1A1F2C]">Entry Price</Label>
                  <Input 
                    id="entry" 
                    type="number" 
                    step="any" 
                    value={entry} 
                    onChange={(e) => setEntry(e.target.value)} 
                    required
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exit" className="text-[#1A1F2C]">Exit Price</Label>
                  <Input 
                    id="exit" 
                    type="number" 
                    step="any" 
                    value={exit} 
                    onChange={(e) => setExit(e.target.value)} 
                    required
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lotSize" className="text-[#1A1F2C]">Lot Size</Label>
                  <Input 
                    id="lotSize" 
                    type="number" 
                    step="any" 
                    value={lotSize} 
                    onChange={(e) => setLotSize(e.target.value)} 
                    required
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stopLoss" className="text-[#1A1F2C]">Stop Loss</Label>
                  <Input 
                    id="stopLoss" 
                    type="number" 
                    step="any" 
                    value={stopLoss} 
                    onChange={(e) => setStopLoss(e.target.value)} 
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="takeProfit" className="text-[#1A1F2C]">Take Profit</Label>
                  <Input 
                    id="takeProfit" 
                    type="number" 
                    step="any" 
                    value={takeProfit} 
                    onChange={(e) => setTakeProfit(e.target.value)} 
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes" className="text-[#1A1F2C]">Duration (minutes)</Label>
                  <Input 
                    id="durationMinutes" 
                    type="number" 
                    value={durationMinutes} 
                    onChange={(e) => setDurationMinutes(e.target.value)} 
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-[#1A1F2C]">Commission/Fees</Label>
                  <Input 
                    id="commission" 
                    type="number" 
                    step="any" 
                    value={commission} 
                    onChange={(e) => setCommission(e.target.value)} 
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profitLoss" className="text-[#1A1F2C]">Profit/Loss</Label>
                  <Input 
                    id="profitLoss" 
                    type="number" 
                    step="any" 
                    value={profitLoss.toString()} 
                    readOnly 
                    className="bg-muted/50 border-[#9b87f5]/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#9b87f5]/30 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#f1f0fb]/50 to-transparent">
              <CardTitle className="text-lg text-[#1A1F2C] flex items-center">Trade Rating</CardTitle>
              <CardDescription>Rate the quality of this trade execution</CardDescription>
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
          
          <Card className="border-[#9b87f5]/30 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#f1f0fb]/50 to-transparent">
              <CardTitle className="text-lg text-[#1A1F2C] flex items-center">Notes & Tags</CardTitle>
              <CardDescription>Add notes and categorize your trade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#1A1F2C]">Trade Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add your trade notes, strategy used, and observations..." 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="min-h-[100px] border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#1A1F2C]">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-[#9b87f5]/10 text-[#7E69AB] hover:bg-[#9b87f5]/20">
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
                    className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/20"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddHashtag} 
                    variant="outline"
                    className="border-[#9b87f5]/30 hover:bg-[#9b87f5]/10 hover:text-[#7E69AB]"
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
                        className="cursor-pointer hover:bg-[#9b87f5]/10 border-[#9b87f5]/30 text-[#7E69AB]"
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
            className="border-[#9b87f5]/30 hover:bg-[#9b87f5]/10 hover:text-[#7E69AB]"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          >
            {isEditing ? 'Update Trade' : 'Add Trade'}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddTrade;
