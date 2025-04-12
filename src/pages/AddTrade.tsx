
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
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
import { PlusCircle } from 'lucide-react';

const AddTrade: React.FC = () => {
  const { addTrade, accounts, pairs, symbols, addSymbol, allHashtags } = useTrade();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    account: '',
    date: new Date().toISOString().slice(0, 10),
    pair: '',
    customPair: '',
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
    hashtags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCustomPairInput, setShowCustomPairInput] = useState(false);

  // Calculate profit/loss and return percentage automatically when entry, exit, and lotSize are provided
  useEffect(() => {
    if (isCalculating) return;

    const { entry, exit, lotSize, type } = formData;
    
    if (entry && exit && lotSize) {
      const entryValue = parseFloat(entry);
      const exitValue = parseFloat(exit);
      const lotSizeValue = parseFloat(lotSize);
      
      if (!isNaN(entryValue) && !isNaN(exitValue) && !isNaN(lotSizeValue)) {
        const pipsValue = type === 'Buy' 
          ? (exitValue - entryValue) * 10000 
          : (entryValue - exitValue) * 10000;
          
        const pipsPerLot = 10; // Simplified calculation, adjust based on actual pip value
        const calculatedPL = pipsValue * pipsPerLot * lotSizeValue;
        
        // Calculate return % (simplified)
        const returnPercentage = ((calculatedPL / 1000) * 100).toFixed(2);
        
        setIsCalculating(true);
        setFormData(prev => ({
          ...prev,
          profitLoss: calculatedPL.toFixed(2),
          returnPercentage
        }));
        setTimeout(() => setIsCalculating(false), 100);
      }
    }
  }, [formData.entry, formData.exit, formData.lotSize, formData.type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    // Handle special case for pair select
    if (name === 'pair' && value === 'custom') {
      setShowCustomPairInput(true);
      return;
    }
    
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAddCustomPair = () => {
    if (!formData.customPair.trim()) {
      setErrors({ ...errors, customPair: 'Please enter a valid symbol' });
      return;
    }
    
    // Add new symbol to the list
    const symbolType = determineSymbolType(formData.customPair);
    const newSymbol = {
      symbol: formData.customPair,
      name: formData.customPair,
      type: symbolType
    };
    
    addSymbol(newSymbol);
    
    // Update form data with new pair
    setFormData({ ...formData, pair: formData.customPair, customPair: '' });
    setShowCustomPairInput(false);
    
    toast({
      title: "Symbol Added",
      description: `${formData.customPair} has been added to your symbols list`,
    });
  };
  
  // Helper function to determine symbol type based on naming pattern
  const determineSymbolType = (symbol: string): 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other' => {
    if (symbol.includes('/')) {
      if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT')) {
        return 'crypto';
      } else {
        return 'forex';
      }
    } else if (/^[A-Z]{2,6}$/.test(symbol)) {
      return 'stock';
    } else if (symbol.toUpperCase().includes('INDEX') || symbol === 'SPX' || symbol === 'NDX' || symbol === 'DJI') {
      return 'index';
    } else if (symbol.toUpperCase().includes('GOLD') || symbol.toUpperCase().includes('SILVER') || symbol === 'CL' || symbol === 'OIL') {
      return 'commodity';
    }
    return 'other';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the final pair value (either selected or custom)
    const finalPair = showCustomPairInput && formData.customPair ? formData.customPair : formData.pair;
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.account) newErrors.account = 'Account is required';
    if (!finalPair) newErrors.pair = 'Currency pair or symbol is required';
    if (!formData.entry) newErrors.entry = 'Entry price is required';
    if (!formData.exit) newErrors.exit = 'Exit price is required';
    if (!formData.lotSize) newErrors.lotSize = 'Lot size is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Convert string values to numbers
    const tradeData = {
      ...formData,
      pair: finalPair,
      entry: parseFloat(formData.entry),
      exit: parseFloat(formData.exit),
      lotSize: parseFloat(formData.lotSize),
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
      takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
      riskPercentage: formData.riskPercentage ? parseFloat(formData.riskPercentage) : 0,
      returnPercentage: formData.returnPercentage ? parseFloat(formData.returnPercentage) : 0,
      profitLoss: parseFloat(formData.profitLoss || '0'),
      durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : 0,
    };
    
    // Remove the customPair property as it's not needed in the final trade data
    delete (tradeData as any).customPair;
    
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
            {/* Basic Trade Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account */}
              <div>
                <Label htmlFor="account">Account</Label>
                <Select
                  value={formData.account}
                  onValueChange={(value) => handleSelectChange('account', value)}
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

              {/* Date */}
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Trade Pair and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pair */}
              <div>
                <Label htmlFor="pair">Currency Pair / Symbol</Label>
                {!showCustomPairInput ? (
                  <div className="flex gap-2">
                    <Select
                      value={formData.pair}
                      onValueChange={(value) => handleSelectChange('pair', value)}
                    >
                      <SelectTrigger className={errors.pair ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select or add custom pair" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {pairs.map((pair) => (
                            <SelectItem key={pair} value={pair}>
                              {pair}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom" className="text-blue-600 font-medium">
                            + Add Custom Symbol
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="customPair"
                      name="customPair"
                      placeholder="Enter custom symbol (e.g. EUR/USD, AAPL)"
                      value={formData.customPair}
                      onChange={handleInputChange}
                      className={errors.customPair ? 'border-red-500' : ''}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="icon"
                      onClick={handleAddCustomPair}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCustomPairInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {errors.pair && <p className="text-red-500 text-sm mt-1">{errors.pair}</p>}
                {errors.customPair && <p className="text-red-500 text-sm mt-1">{errors.customPair}</p>}
              </div>

              {/* Type */}
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

            {/* Entry, Exit, Lot Size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Entry */}
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

              {/* Exit */}
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

              {/* Lot Size */}
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

            {/* Stop Loss, Take Profit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stop Loss */}
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

              {/* Take Profit */}
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

            {/* Risk %, Profit/Loss, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk % */}
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

              {/* Profit/Loss */}
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

              {/* Duration */}
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

            {/* Notes */}
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

            {/* Hashtags */}
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
            
            {/* Before/After Trade Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Image */}
              <div>
                <Label htmlFor="beforeImage">Before Trade Image</Label>
                <p className="text-sm text-gray-500 mb-2">Upload an image of the chart before your entry</p>
                <ImageUpload
                  value={formData.beforeImageUrl}
                  onChange={(imageUrl) => setFormData({ ...formData, beforeImageUrl: imageUrl })}
                />
              </div>

              {/* After Image */}
              <div>
                <Label htmlFor="afterImage">After Trade Image</Label>
                <p className="text-sm text-gray-500 mb-2">Upload an image of the chart after your exit</p>
                <ImageUpload
                  value={formData.afterImageUrl}
                  onChange={(imageUrl) => setFormData({ ...formData, afterImageUrl: imageUrl })}
                />
              </div>
            </div>
            
            {/* Original chart image */}
            <div>
              <Label htmlFor="image">Additional Chart Image (Optional)</Label>
              <p className="text-sm text-gray-500 mb-2">Upload any other relevant chart image</p>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
              />
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
