import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrade } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { calculateProfitLoss, calculateReturnPercentage, calculateRiskPercentage } from '@/utils/tradeUtils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from '@/components/ImageUploader';
import { Trade } from '@/types/settings';
import { Calendar } from '@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Listbox } from '@headlessui/react'

const marketSessions = [
  { id: 'asia', name: 'Asia' },
  { id: 'london', name: 'London' },
  { id: 'newYork', name: 'New York' },
  { id: 'londonClose', name: 'London Close' },
  { id: 'overlap', name: 'Overlap' },
  { id: 'other', name: 'Other' },
];

const AddTrade: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { addTrade, updateTrade, getTrade, pairs, addSymbol, tradingAccounts } = useTrade();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | undefined>(undefined);
  const [tradeData, setTradeData] = useState<Omit<Trade, 'id' | 'createdAt'>>({
    userId: user?.id || 'demo-user-id',
    pair: pairs[0] || 'EURUSD',
    type: 'Buy',
    entry: 0,
    exit: 0,
    lotSize: 0,
    stopLoss: 0,
    takeProfit: 0,
    riskPercentage: 0,
    returnPercentage: 0,
    profitLoss: 0,
    durationMinutes: 0,
    notes: '',
    date: format(new Date(), "yyyy-MM-dd"),
    account: tradingAccounts[0] || 'Demo',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: [],
    commission: 0,
    rating: 0,
    total: 0,
    playbook: '',
    followedRules: [],
    marketSession: marketSessions[0].name,
    symbol: pairs[0] || 'EURUSD'
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (isEditMode && id) {
      const trade = getTrade(id);
      if (trade) {
        setSelectedTrade(trade);
        setTradeData({
          userId: trade.userId,
          pair: trade.pair,
          symbol: trade.symbol || trade.pair,
          type: trade.type,
          entry: trade.entry,
          exit: trade.exit || 0,
          lotSize: trade.lotSize,
          stopLoss: trade.stopLoss || 0,
          takeProfit: trade.takeProfit || 0,
          riskPercentage: trade.riskPercentage,
          returnPercentage: trade.returnPercentage,
          profitLoss: trade.profitLoss,
          durationMinutes: trade.durationMinutes || 0,
          notes: trade.notes,
          date: trade.date,
          account: trade.account,
          imageUrl: trade.imageUrl,
          beforeImageUrl: trade.beforeImageUrl,
          afterImageUrl: trade.afterImageUrl,
          hashtags: trade.hashtags,
          commission: trade.commission,
          rating: trade.rating,
          total: trade.total,
          playbook: trade.playbook || '',
          followedRules: trade.followedRules || [],
          marketSession: trade.marketSession || marketSessions[0].name
        });
        setSelectedDate(new Date(trade.date));
      }
    }
  }, [isEditMode, id, getTrade]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTradeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTradeData(prev => ({ ...prev, [name]: value }));
    if (name === 'pair') {
      setTradeData(prev => ({ ...prev, symbol: value }));
    }
  };

  const handleSaveClick = async () => {
    if (!tradeData.pair || !tradeData.type || !tradeData.entry || !tradeData.exit || !tradeData.lotSize) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(Number(tradeData.entry)) || isNaN(Number(tradeData.exit)) || isNaN(Number(tradeData.lotSize))) {
      toast({
        title: "Error",
        description: "Entry, Exit, and Lot Size must be numbers.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const currentUser = user || { id: 'demo-user-id' }; // Fallback to a demo ID if user is null
    
      // Calculate P/L
      const profitOrLoss = calculateProfitLoss(tradeData);
    
      // Create the final trade object with calculated fields
      const finalTradeData = {
        ...tradeData,
        userId: currentUser.id, // Add userId
        returnPercentage: calculateReturnPercentage(tradeData),
        riskPercentage: calculateRiskPercentage(tradeData),
        profitLoss: profitOrLoss,
        total: profitOrLoss - (tradeData.commission || 0)
      };
    
      if (isEditMode && selectedTrade) {
        await updateTrade(selectedTrade.id, finalTradeData);
        toast({
          title: "Trade Updated",
          description: "Trade has been updated successfully"
        });
      } else {
        await addTrade(finalTradeData);
        toast({
          title: "Trade Added",
          description: "Trade has been added successfully"
        });
      }

      navigate('/trades');
    } catch (error) {
      console.error("Error adding/updating trade:", error);
      toast({
        title: "Error",
        description: "Failed to save trade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string, field: string) => {
    setTradeData(prev => ({ ...prev, [field]: imageUrl }));
  };

  const handleAddSymbol = () => {
    const newSymbol = prompt("Enter new trading pair symbol:");
    if (newSymbol) {
      addSymbol(newSymbol);
      setTradeData(prev => ({ ...prev, pair: newSymbol, symbol: newSymbol }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setTradeData(prev => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Trade' : 'Add New Trade'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pair">Trading Pair</Label>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={(value) => handleSelectChange('pair', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select pair" defaultValue={tradeData.pair} />
                    </SelectTrigger>
                    <SelectContent>
                      {pairs.map((pair) => (
                        <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="sm" onClick={handleAddSymbol}>
                    Add Pair
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" defaultValue={tradeData.type} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry">Entry Price</Label>
                <Input
                  type="number"
                  id="entry"
                  name="entry"
                  value={tradeData.entry.toString()}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="exit">Exit Price</Label>
                <Input
                  type="number"
                  id="exit"
                  name="exit"
                  value={tradeData.exit.toString()}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input
                  type="number"
                  id="lotSize"
                  name="lotSize"
                  value={tradeData.lotSize.toString()}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="commission">Commission</Label>
                <Input
                  type="number"
                  id="commission"
                  name="commission"
                  value={tradeData.commission.toString()}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  type="number"
                  id="stopLoss"
                  name="stopLoss"
                  value={tradeData.stopLoss.toString()}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="takeProfit">Take Profit</Label>
                <Input
                  type="number"
                  id="takeProfit"
                  name="takeProfit"
                  value={tradeData.takeProfit.toString()}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={tradeData.notes}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Entry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "yyyy-MM-dd")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      disabled={(date) =>
                        date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="account">Account</Label>
                <Select onValueChange={(value) => handleSelectChange('account', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" defaultValue={tradeData.account} />
                  </SelectTrigger>
                  <SelectContent>
                    {tradingAccounts.map((account) => (
                      <SelectItem key={account} value={account}>{account}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="marketSession">Market Session</Label>
              <Listbox value={tradeData.marketSession} onChange={(value) => handleSelectChange('marketSession', value)}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">{tradeData.marketSession}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      {/* Heroicon small */}
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1.5 1.5 0 01.354 2.929l4.5 4.5a1.5 1.5 0 11-2.122 2.122L10 9.121l-2.732 2.732a1.5 1.5 0 11-2.122-2.122l4.5-4.5A1.5 1.5 0 0110 3zm0 14a1.5 1.5 0 01-.354-2.929l-4.5-4.5a1.5 1.5 0 112.122-2.122L10 14.879l2.732-2.732a1.5 1.5 0 112.122 2.122l-4.5 4.5A1.5 1.5 0 0110 17z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {marketSessions.map((session) => (
                      <Listbox.Option
                        key={session.id}
                        className={({ active }) =>
                          cn("relative cursor-default select-none py-2 pl-10 pr-4",
                            active ? "bg-amber-100 text-amber-900" : "text-gray-900")}
                        value={session.name}
                      >
                        {({ selected }) => (
                          <>
                            <span className={cn("block truncate", selected ? 'font-medium' : 'font-normal')}>
                              {session.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                {/* Heroicon check */}
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <ImageUploader
                label="Before Image"
                onUpload={(url) => handleImageUpload(url, 'beforeImageUrl')}
                existingImageUrl={tradeData.beforeImageUrl}
              />
              <ImageUploader
                label="After Image"
                onUpload={(url) => handleImageUpload(url, 'afterImageUrl')}
                existingImageUrl={tradeData.afterImageUrl}
              />
              <ImageUploader
                label="Additional Image"
                onUpload={(url) => handleImageUpload(url, 'imageUrl')}
                existingImageUrl={tradeData.imageUrl}
              />
            </div>

            <Button onClick={handleSaveClick} disabled={loading}>
              {loading ? 'Saving...' : 'Save Trade'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddTrade;
