import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Plus, X } from "lucide-react";
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import StarRating from '@/components/StarRating';
import { supabase } from '@/lib/supabase';
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrade, updateTrade, addTrade, pairs, accounts, allHashtags, addHashtag, calculateProfitLoss } = useTrade();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [pair, setPair] = useState('');
  const [type, setType<'Buy' | 'Sell'>('Buy');
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
  const [profitLoss, setProfitLoss] = useState<string>('0');  // Changed to string for direct editing
  const [commission, setCommission] = useState('0');
  const [rating, setRating] = useState(0);
  
  // Fetch trade data from database if editing
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
        // Extract date from entry_date
        if (data.entry_date) {
          setDate(data.entry_date.split('T')[0]);
        }
        setNotes(data.notes || '');
        setHashtags(data.tags || []);
        setProfitLoss(data.profit_loss?.toString() || '0');
        setCommission(data.fees?.toString() || '0');
        setRating(data.rating || 0);
        setAccount(accounts[0] || ''); // Set default account
        setIsEditing(true);
        
        // Add new fields for populating additional trade details
        setStopLoss(data.stop_loss?.toString() || '');
        setTakeProfit(data.take_profit?.toString() || '');
        setDurationMinutes(data.duration_minutes?.toString() || '');
        setCommission(data.fees?.toString() || '0');
      }
    } catch (error) {
      console.error('Error fetching trade:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات التداول",
        variant: "destructive"
      });
      navigate('/trades');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load trade data if editing
  useEffect(() => {
    if (id) {
      fetchTradeFromDb(id);
    } else {
      // Default values for new trade
      setAccount(accounts[0] || '');
    }
  }, [id, accounts, navigate, toast]);

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
      
      // Only update profit/loss if user hasn't manually edited it
      if (!isEditing) {
        setProfitLoss(calculatedPL.toString());
      }
    }
  }, [entry, exit, lotSize, type, pair, calculateProfitLoss, isEditing]);

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
    if (!pair || !type || !entry || !date || !account) {
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
      exit: exit ? parseFloat(exit) : null,
      lotSize: parseFloat(lotSize),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      date,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : 0,
      notes,
      account,
      hashtags,
      profitLoss: parseFloat(profitLoss),
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
                    <Select value={pair} onValueChange={setPair} required>
                      <SelectTrigger id="pair">
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
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Price Information</CardTitle>
                <CardDescription>Enter the entry, exit, and risk management details</CardDescription>
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">Lot Size</Label>
                    <Input 
                      id="lotSize" 
                      type="number" 
                      step="any" 
                      value={lotSize} 
                      onChange={(e) => setLotSize(e.target.value)} 
                      required
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                    <Input 
                      id="durationMinutes" 
                      type="number" 
                      value={durationMinutes} 
                      onChange={(e) => setDurationMinutes(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission/Fees</Label>
                    <Input 
                      id="commission" 
                      type="number" 
                      step="any" 
                      value={commission} 
                      onChange={(e) => setCommission(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profitLoss">Profit/Loss</Label>
                    <Input 
                      id="profitLoss" 
                      type="number" 
                      step="any" 
                      value={profitLoss} 
                      onChange={(e) => setProfitLoss(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trade Rating</CardTitle>
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
                    placeholder="Add your trade notes, strategy used, and observations..." 
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
    </Layout>
  );
};

export default AddTrade;
