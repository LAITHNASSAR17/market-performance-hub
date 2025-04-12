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
import { useLanguage } from '@/contexts/LanguageContext';
import CurrencyPairInput from '@/components/CurrencyPairInput';

const AddTrade: React.FC = () => {
  const { addTrade, accounts, pairs, symbols, addSymbol, allHashtags } = useTrade();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    account: '',
    date: new Date().toISOString().slice(0, 10),
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
    hashtags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

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
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePairChange = (value: string) => {
    setFormData({ ...formData, pair: value });
    
    // Clear error when field is edited
    if (errors.pair) {
      setErrors({ ...errors, pair: '' });
    }
    
    // Add to pairs list if it's a new pair
    if (value && !pairs.includes(value)) {
      // Add new symbol to the list
      const symbolType = determineSymbolType(value);
      const newSymbol = {
        symbol: value,
        name: value,
        type: symbolType
      };
      
      addSymbol(newSymbol);
    }
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
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.account) newErrors.account = t('addTrade.accountRequired') || 'Account is required';
    if (!formData.pair) newErrors.pair = t('addTrade.pairRequired') || 'Currency pair or symbol is required';
    if (!formData.entry) newErrors.entry = t('addTrade.entryRequired') || 'Entry price is required';
    if (!formData.exit) newErrors.exit = t('addTrade.exitRequired') || 'Exit price is required';
    if (!formData.lotSize) newErrors.lotSize = t('addTrade.lotSizeRequired') || 'Lot size is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Convert string values to numbers
    const tradeData = {
      ...formData,
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
    
    addTrade(tradeData);
    toast({
      title: t('addTrade.tradeAdded') || "Trade Added",
      description: t('addTrade.tradeAddedSuccess') || "Your trade has been added successfully",
    });
    navigate('/trades');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{t('addTrade.title') || "Add New Trade"}</h1>
        <p className="text-gray-500">{t('addTrade.description') || "Record details about your trade"}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{t('addTrade.tradeInformation') || "Trade Information"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Trade Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account */}
              <div>
                <Label htmlFor="account">{t('addTrade.account') || "Account"}</Label>
                <Select
                  value={formData.account}
                  onValueChange={(value) => handleSelectChange('account', value)}
                >
                  <SelectTrigger className={errors.account ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('addTrade.selectAccount') || "Select account"} />
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
                <Label htmlFor="date">{t('addTrade.date') || "Date"}</Label>
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
                <Label htmlFor="pair">{t('addTrade.currencyPair') || "Currency Pair / Symbol"}</Label>
                <CurrencyPairInput
                  value={formData.pair}
                  onChange={handlePairChange}
                  options={pairs}
                  placeholder={t('addTrade.selectOrType') || "Select or type currency pair"}
                  error={errors.pair}
                />
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="type">{t('addTrade.type') || "Type"}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">{t('addTrade.buy') || "Buy"}</SelectItem>
                    <SelectItem value="Sell">{t('addTrade.sell') || "Sell"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Entry, Exit, Lot Size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Entry */}
              <div>
                <Label htmlFor="entry">{t('addTrade.entry') || "Entry Price"}</Label>
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
                <Label htmlFor="exit">{t('addTrade.exit') || "Exit Price"}</Label>
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
                <Label htmlFor="lotSize">{t('addTrade.lotSize') || "Lot Size"}</Label>
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
                <Label htmlFor="stopLoss">{t('addTrade.stopLoss') || "Stop Loss (optional)"}</Label>
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
                <Label htmlFor="takeProfit">{t('addTrade.takeProfit') || "Take Profit (optional)"}</Label>
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
                <Label htmlFor="riskPercentage">{t('addTrade.riskPercentage') || "Risk %"}</Label>
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
                <Label htmlFor="profitLoss">{t('addTrade.profitLoss') || "Profit/Loss"}</Label>
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
                <Label htmlFor="durationMinutes">{t('addTrade.duration') || "Duration (minutes)"}</Label>
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
              <Label htmlFor="notes">{t('addTrade.notes') || "Notes"}</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder={t('addTrade.notesPlaceholder') || "Enter trade notes, observations, or reasons for taking the trade"}
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            {/* Hashtags */}
            <div>
              <Label htmlFor="hashtags">{t('addTrade.hashtags') || "Hashtags"}</Label>
              <HashtagInput
                id="hashtags"
                value={formData.hashtags}
                onChange={(hashtags) => setFormData({ ...formData, hashtags })}
                suggestions={allHashtags}
                placeholder={t('addTrade.hashtagsPlaceholder') || "Add hashtags (e.g. setup, breakout, mistake)"}
              />
            </div>

            <Separator className="my-6" />
            
            <h3 className="text-lg font-medium">{t('addTrade.tradeImages') || "Trade Images"}</h3>
            
            {/* Before/After Trade Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Image */}
              <div>
                <Label htmlFor="beforeImage">{t('addTrade.beforeImage') || "Before Trade Image"}</Label>
                <p className="text-sm text-gray-500 mb-2">{t('addTrade.uploadBeforeImage') || "Upload an image of the chart before your entry"}</p>
                <ImageUpload
                  value={formData.beforeImageUrl}
                  onChange={(imageUrl) => setFormData({ ...formData, beforeImageUrl: imageUrl })}
                />
              </div>

              {/* After Image */}
              <div>
                <Label htmlFor="afterImage">{t('addTrade.afterImage') || "After Trade Image"}</Label>
                <p className="text-sm text-gray-500 mb-2">{t('addTrade.uploadAfterImage') || "Upload an image of the chart after your exit"}</p>
                <ImageUpload
                  value={formData.afterImageUrl}
                  onChange={(imageUrl) => setFormData({ ...formData, afterImageUrl: imageUrl })}
                />
              </div>
            </div>
            
            {/* Original chart image */}
            <div>
              <Label htmlFor="image">{t('addTrade.originalImage') || "Additional Chart Image (Optional)"}</Label>
              <p className="text-sm text-gray-500 mb-2">{t('addTrade.uploadOriginalImage') || "Upload any other relevant chart image"}</p>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/trades')}>
              {t('addTrade.cancel') || "Cancel"}
            </Button>
            <Button type="submit">{t('addTrade.saveTrade') || "Save Trade"}</Button>
          </CardFooter>
        </form>
      </Card>
    </Layout>
  );
};

export default AddTrade;
