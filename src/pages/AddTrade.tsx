import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import HashtagInput from '@/components/HashtagInput';
import ImageUpload from '@/components/ImageUpload';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const EMOTIONS = [
  "Confident",
  "Nervous",
  "Fearful",
  "Excited",
  "Angry",
  "Calm",
  "Anxious",
  "Hesitant",
  "Overconfident",
  "Neutral",
  "Other"
] as const;

const OUTCOME_REASONS = [
  "Followed my trading plan",
  "Didn't follow trading plan",
  "Emotional decision",
  "Market volatility",
  "Overtraded",
  "Poor risk management",
  "Late entry",
  "Early exit",
  "Missed confirmation",
  "News impact",
  "Technical setup worked perfectly",
  "TP hit / SL hit as expected",
  "Reversal not anticipated",
  "Chased the market",
  "FOMO (Fear of Missing Out)",
  "Misread the trend",
  "Overleveraged",
  "Took partials too early",
  "Other"
] as const;

const AddTrade: React.FC = () => {
  const { 
    addTrade, 
    accounts,
    allHashtags,
  } = useTrade();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    account: '',
    date: new Date(),
    pair: '',
    type: 'Buy' as 'Buy' | 'Sell',
    entry: '',
    exit: '',
    lotSize: '',
    stopLoss: '',
    takeProfit: '',
    riskPercentage: '',
    returnPercentage: '',
    profitLoss: '',
    durationMinutes: '',
    notes: '',
    imageUrl: null as string | null,
    beforeImageUrl: null as string | null,
    afterImageUrl: null as string | null,
    hashtags: [] as string[],
    commission: '',
    emotion: '',
    otherEmotion: '',
    outcomeReasons: [] as string[],
    otherOutcomeReason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.account) newErrors.account = 'Account is required';
    if (!formData.pair) newErrors.pair = 'Currency pair is required';
    if (!formData.entry) newErrors.entry = 'Entry price is required';
    if (!formData.exit) newErrors.exit = 'Exit price is required';
    if (!formData.lotSize) newErrors.lotSize = 'Lot size is required';
    if (!formData.profitLoss) newErrors.profitLoss = 'Profit/Loss is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const tradeData = {
      ...formData,
      entry: parseFloat(formData.entry),
      exit: parseFloat(formData.exit),
      lotSize: parseFloat(formData.lotSize),
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
      takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
      riskPercentage: formData.riskPercentage ? parseFloat(formData.riskPercentage) : 0,
      returnPercentage: formData.returnPercentage ? parseFloat(formData.returnPercentage) : 0,
      profitLoss: parseFloat(formData.profitLoss),
      durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : 0,
      date: formData.date.toISOString().split('T')[0],
      commission: formData.commission ? parseFloat(formData.commission) : 0
    };
    
    addTrade(tradeData);
    toast({
      title: "Trade Added",
      description: "Your trade has been added successfully",
    });
    navigate('/trades');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Add New Trade</h1>
        <p className="text-gray-500">Record details about your trade</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Trade Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="account">Account</Label>
                <Select
                  value={formData.account}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, account: value }))}
                >
                  <SelectTrigger className={errors.account ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {accounts.map((account) => (
                        <SelectItem key={account} value={account}>
                          {account}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account}</p>}
              </div>

              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>اختر تاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pair">Currency Pair / Symbol</Label>
                <Input
                  id="pair"
                  name="pair"
                  type="text"
                  placeholder="E.g. EURUSD, BTCUSD, AAPL"
                  value={formData.pair}
                  onChange={handleInputChange}
                  className={errors.pair ? 'border-red-500' : ''}
                />
                {errors.pair && <p className="text-red-500 text-sm mt-1">{errors.pair}</p>}
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="entry">Entry Price</Label>
                <Input
                  id="entry"
                  name="entry"
                  type="number"
                  step="0.00001"
                  placeholder="0.0000"
                  value={formData.entry}
                  onChange={handleInputChange}
                  className={errors.entry ? 'border-red-500' : ''}
                />
                {errors.entry && <p className="text-red-500 text-sm mt-1">{errors.entry}</p>}
              </div>

              <div>
                <Label htmlFor="exit">Exit Price</Label>
                <Input
                  id="exit"
                  name="exit"
                  type="number"
                  step="0.00001"
                  placeholder="0.0000"
                  value={formData.exit}
                  onChange={handleInputChange}
                  className={errors.exit ? 'border-red-500' : ''}
                />
                {errors.exit && <p className="text-red-500 text-sm mt-1">{errors.exit}</p>}
              </div>

              <div>
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input
                  id="lotSize"
                  name="lotSize"
                  type="number"
                  step="0.01"
                  placeholder="0.01"
                  value={formData.lotSize}
                  onChange={handleInputChange}
                  className={errors.lotSize ? 'border-red-500' : ''}
                />
                {errors.lotSize && <p className="text-red-500 text-sm mt-1">{errors.lotSize}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stopLoss">Stop Loss (optional)</Label>
                <Input
                  id="stopLoss"
                  name="stopLoss"
                  type="number"
                  step="0.00001"
                  placeholder="0.0000"
                  value={formData.stopLoss}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="takeProfit">Take Profit (optional)</Label>
                <Input
                  id="takeProfit"
                  name="takeProfit"
                  type="number"
                  step="0.00001"
                  placeholder="0.0000"
                  value={formData.takeProfit}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="riskPercentage">Risk %</Label>
                <Input
                  id="riskPercentage"
                  name="riskPercentage"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.riskPercentage}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="profitLoss">Profit/Loss</Label>
                <Input
                  id="profitLoss"
                  name="profitLoss"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.profitLoss}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="commission">Commission / Spread</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.commission}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  placeholder="0"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter trade notes, observations, or reasons for taking the trade"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="hashtags">Hashtags</Label>
              <HashtagInput
                id="hashtags"
                value={formData.hashtags}
                onChange={(hashtags) => setFormData({ ...formData, hashtags })}
                suggestions={allHashtags}
                placeholder="Add hashtags (e.g. setup, breakout, mistake)"
              />
            </div>

            <Separator className="my-6" />
            
            <h3 className="text-lg font-medium">Trade Images</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="beforeImage">Before Trade Image</Label>
                <p className="text-sm text-gray-500 mb-2">Upload an image of the chart before your entry</p>
                <ImageUpload
                  value={formData.beforeImageUrl}
                  onChange={(imageUrl) => setFormData({ ...formData, beforeImageUrl: imageUrl })}
                />
              </div>

              <div>
                <Label htmlFor="afterImage">After Trade Image</Label>
                <p className="text-sm text-gray-500 mb-2">Upload an image of the chart after your exit</p>
                <ImageUpload
                  value={formData.afterImageUrl}
                  onChange={(imageUrl) => setFormData({ ...formData, afterImageUrl: imageUrl })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="image">Additional Chart Image (Optional)</Label>
              <p className="text-sm text-gray-500 mb-2">Upload any other relevant chart image</p>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="emotion">How did you feel during this trade?</Label>
              <Select
                value={formData.emotion}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    emotion: value,
                    otherEmotion: value !== 'Other' ? '' : prev.otherEmotion
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EMOTIONS.map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>
                        {emotion}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {formData.emotion === 'Other' && (
                <Input
                  placeholder="Specify other emotion"
                  value={formData.otherEmotion}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    otherEmotion: e.target.value
                  }))}
                />
              )}
            </div>

            <div className="space-y-4">
              <Label>Reason for Profit or Loss</Label>
              <div className="flex flex-wrap gap-2">
                {OUTCOME_REASONS.map((reason) => (
                  <Badge
                    key={reason}
                    variant={formData.outcomeReasons.includes(reason) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        outcomeReasons: prev.outcomeReasons.includes(reason)
                          ? prev.outcomeReasons.filter(r => r !== reason)
                          : [...prev.outcomeReasons, reason]
                      }))
                    }}
                  >
                    {reason}
                  </Badge>
                ))}
              </div>

              {formData.outcomeReasons.includes('Other') && (
                <Input
                  placeholder="Specify other reason"
                  value={formData.otherOutcomeReason}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    otherOutcomeReason: e.target.value
                  }))}
                />
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/trades')}>
              Cancel
            </Button>
            <Button type="submit">Save Trade</Button>
          </CardFooter>
        </form>
      </Card>
    </Layout>
  );
};

export default AddTrade;
