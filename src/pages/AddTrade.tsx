import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from 'react-router-dom';
import { useTrade } from '@/contexts/TradeContext';
import { PlusCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Trade } from '@/types/trade';
import { usePlaybooks } from '@/hooks/usePlaybooks';

interface FormData {
  pair: string;
  account: string;
  date: string;
  type: 'Buy' | 'Sell';
  entry: number;
  exit: number;
  lotSize: number;
  stopLoss: number;
  takeProfit: number;
  durationMinutes: number;
  commission: number;
  notes: string;
  hashtags: string[];
  rating: number;
  marketSession: string;
  playbook: string;
  followedRules: string[];
}

const AddTrade: React.FC = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  const { addTrade, accounts, pairs, getTrade, updateTrade, allHashtags, addHashtag, tradingAccounts, symbols } = useTrade();
  const { playbooks } = usePlaybooks();
  const navigate = useNavigate();
  const { editTradeId } = useParams<{ editTradeId: string }>();
  const { toast } = useToast();
  const [newHashtag, setNewHashtag] = useState('');
  const [values, setValues] = useState<Partial<FormData>>({
    pair: '',
    account: '',
    date: '',
    type: 'Buy',
    entry: 0,
    exit: 0,
    lotSize: 0,
    stopLoss: 0,
    takeProfit: 0,
    durationMinutes: 0,
    commission: 0,
    notes: '',
    hashtags: [],
    rating: 0,
    marketSession: '',
    playbook: '',
    followedRules: [],
  });

  useEffect(() => {
    if (editTradeId) {
      const tradeToEdit = getTrade(editTradeId);
      if (tradeToEdit) {
        setValues({
          ...values,
          pair: tradeToEdit.pair || tradeToEdit.symbol || '',
          account: tradeToEdit.account || (tradeToEdit.accountId ? 'Main Trading' : ''),
          date: tradeToEdit.date || (tradeToEdit.entryDate ? format(new Date(tradeToEdit.entryDate), 'yyyy-MM-dd') : ''),
          type: tradeToEdit.type || (tradeToEdit.direction === 'long' ? 'Buy' : 'Sell'),
          entry: tradeToEdit.entry || tradeToEdit.entryPrice || 0,
          exit: tradeToEdit.exit || tradeToEdit.exitPrice || 0,
          lotSize: tradeToEdit.lotSize || tradeToEdit.quantity || 0,
          stopLoss: tradeToEdit.stopLoss || 0,
          takeProfit: tradeToEdit.takeProfit || 0,
          durationMinutes: tradeToEdit.durationMinutes || 0,
          commission: tradeToEdit.fees || 0,
          notes: tradeToEdit.notes || '',
          hashtags: tradeToEdit.hashtags || tradeToEdit.tags || [],
          rating: tradeToEdit.rating || 0,
          marketSession: tradeToEdit.marketSession || '',
          playbook: tradeToEdit.playbook || '',
          followedRules: tradeToEdit.followedRules || [],
        });
      }
    }
  }, [editTradeId, getTrade]);

  const onSubmit = async (data: FormData) => {
    const hashtags = data.hashtags || [];
    const newTrade = {
      ...data,
      hashtags: hashtags,
    };

    try {
      if (editTradeId) {
        await updateTrade(editTradeId, newTrade);
        toast({
          title: "Trade Updated",
          description: "Your trade has been updated successfully.",
        });
      } else {
        await addTrade(newTrade);
        toast({
          title: "Trade Added",
          description: "Your trade has been added successfully.",
        });
      }
      navigate('/trades');
    } catch (error) {
      console.error("Error adding/updating trade:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem adding/updating your trade.",
      });
    }
  };

  const handleAddHashtag = () => {
    if (newHashtag.trim() !== '') {
      addHashtag(newHashtag.trim());
      setValue('hashtags', [...(values.hashtags || []), newHashtag.trim()], { shouldValidate: false });
      setValues({ ...values, hashtags: [...(values.hashtags || []), newHashtag.trim()] });
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    const updatedHashtags = (values.hashtags || []).filter(tag => tag !== tagToRemove);
    setValue('hashtags', updatedHashtags, { shouldValidate: false });
    setValues({ ...values, hashtags: updatedHashtags });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {editTradeId ? 'Edit Trade' : 'Add New Trade'}
        </h1>
        <p className="text-gray-500">Record your trading activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
          <CardDescription>Enter the details of your trade below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="pair">Trading Pair</Label>
                <Input
                  id="pair"
                  type="text"
                  defaultValue={values.pair?.toString()}
                  {...register("pair", { required: 'Trading pair is required' })}
                  onChange={handleInputChange}
                />
                {errors.pair && (
                  <p className="text-red-500 text-sm mt-1">{errors.pair.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="account">Account</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("account", value)}
                  defaultValue={values.account?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradingAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Entry Date</Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={values.date?.toString()}
                  {...register("date", { required: 'Entry date is required' })}
                  onChange={handleInputChange}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Trade Type</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("type", value)}
                  defaultValue={values.type?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select trade type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entry">Entry Price</Label>
                <Input
                  id="entry"
                  type="number"
                  step="0.00001"
                  defaultValue={values.entry?.toString()}
                  {...register("entry", {
                    required: 'Entry price is required',
                    valueAsNumber: true,
                  })}
                  onChange={handleInputChange}
                />
                {errors.entry && (
                  <p className="text-red-500 text-sm mt-1">{errors.entry.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="exit">Exit Price</Label>
                <Input
                  id="exit"
                  type="number"
                  step="0.00001"
                  defaultValue={values.exit?.toString()}
                  {...register("exit", {
                    required: 'Exit price is required',
                    valueAsNumber: true,
                  })}
                  onChange={handleInputChange}
                />
                {errors.exit && (
                  <p className="text-red-500 text-sm mt-1">{errors.exit.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  defaultValue={values.lotSize?.toString()}
                  {...register("lotSize", {
                    required: 'Lot size is required',
                    valueAsNumber: true,
                  })}
                  onChange={handleInputChange}
                />
                {errors.lotSize && (
                  <p className="text-red-500 text-sm mt-1">{errors.lotSize.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.00001"
                  defaultValue={values.stopLoss?.toString()}
                  {...register("stopLoss", { valueAsNumber: true })}
                  onChange={handleInputChange}
                />
                {errors.stopLoss && (
                  <p className="text-red-500 text-sm mt-1">{errors.stopLoss.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="takeProfit">Take Profit</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.00001"
                  defaultValue={values.takeProfit?.toString()}
                  {...register("takeProfit", { valueAsNumber: true })}
                  onChange={handleInputChange}
                />
                {errors.takeProfit && (
                  <p className="text-red-500 text-sm mt-1">{errors.takeProfit.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  defaultValue={values.durationMinutes?.toString()}
                  {...register("durationMinutes", { valueAsNumber: true })}
                  onChange={handleInputChange}
                />
                {errors.durationMinutes && (
                  <p className="text-red-500 text-sm mt-1">{errors.durationMinutes.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="commission">Commission</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  defaultValue={values.commission?.toString()}
                  {...register("commission", {
                    required: 'Commission is required',
                    valueAsNumber: true,
                  })}
                  onChange={handleInputChange}
                />
                {errors.commission && (
                  <p className="text-red-500 text-sm mt-1">{errors.commission.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  defaultValue={values.notes?.toString()}
                  {...register("notes")}
                  onChange={handleInputChange}
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                )}
              </div>

              <div>
                <Label>Hashtags</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Add new hashtag"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={handleAddHashtag}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(values.hashtags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {tag}
                      <XCircle
                        onClick={() => handleRemoveHashtag(tag)}
                        className="ml-1 h-3 w-3 cursor-pointer"
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("rating", value)}
                  defaultValue={values.rating?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="marketSession">Market Session</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("marketSession", value)}
                  defaultValue={values.marketSession?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia">Asia</SelectItem>
                    <SelectItem value="London">London</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="London Close">London Close</SelectItem>
                    <SelectItem value="Overlap">Overlap</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="playbook">Playbook</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("playbook", value)}
                  defaultValue={values.playbook?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select playbook" />
                  </SelectTrigger>
                  <SelectContent>
                    {playbooks.map((playbook) => (
                      <SelectItem key={playbook.id} value={playbook.name}>
                        {playbook.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="followedRules">Followed Rules</Label>
                <Textarea
                  id="followedRules"
                  placeholder="List the rules you followed, separated by commas"
                  defaultValue={values.followedRules?.join(', ')?.toString()}
                  {...register("followedRules")}
                  onChange={(e) => {
                    const rules = e.target.value.split(',').map(rule => rule.trim());
                    setValue('followedRules', rules, { shouldValidate: false });
                    setValues({ ...values, followedRules: rules });
                  }}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate('/trades')}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            {editTradeId ? 'Update Trade' : 'Add Trade'}
          </Button>
        </CardFooter>
      </Card>
    </Layout>
  );
};

export default AddTrade;
