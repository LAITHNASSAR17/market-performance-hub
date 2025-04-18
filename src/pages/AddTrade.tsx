
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useTrade } from '@/contexts/TradeContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import HashtagInput from '@/components/HashtagInput';
import StarRating from '@/components/StarRating';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Calculator, CalendarDays, Search } from 'lucide-react';
import TradingSessionSelector from '@/components/TradingSessionSelector';
import ImportTradesDialog from '@/components/trades/ImportTradesDialog';
import AddTradeButtons from '@/components/trades/AddTradeButtons';

// Rest of the AddTrade component
const formSchema = z.object({
  pair: z.string().min(1, { message: "Trading pair is required." }),
  type: z.enum(['Buy', 'Sell'], {
    required_error: "You need to select a trade type.",
  }),
  entry: z.number({
    required_error: "Entry price is required.",
    invalid_type_error: "Entry price must be a number."
  }),
  exit: z.number({
    invalid_type_error: "Exit price must be a number."
  }).nullable(),
  lotSize: z.number({
    required_error: "Lot size is required.",
    invalid_type_error: "Lot size must be a number."
  }),
  stopLoss: z.number({
    invalid_type_error: "Stop loss must be a number."
  }).nullable(),
  takeProfit: z.number({
    invalid_type_error: "Take profit must be a number."
  }).nullable(),
  date: z.date({
    required_error: "A date is required.",
    invalid_type_error: "That's not a valid date.",
  }),
  notes: z.string().optional(),
  commission: z.number({
    invalid_type_error: "Commission must be a number."
  }).optional(),
  rating: z.number().optional(),
  durationMinutes: z.number({
    invalid_type_error: "Duration must be a number."
  }).nullable(),
  marketSession: z.string().optional(),
});

const AddTrade = () => {
  const { pairs, symbols, addTrade, calculateProfitLoss } = useTrade();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('details');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Form setup with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pair: '',
      type: 'Buy',
      entry: 0,
      exit: null,
      lotSize: 0,
      stopLoss: null,
      takeProfit: null,
      date: new Date(),
      notes: '',
      commission: 0,
      rating: 0,
      durationMinutes: null,
      marketSession: undefined
    }
  });

  // Handle submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const profitLoss = calculateProfitLoss(
        values.entry,
        values.exit || 0,
        values.lotSize,
        values.type,
        values.pair
      );

      await addTrade({
        pair: values.pair,
        type: values.type,
        entry: values.entry,
        exit: values.exit,
        lotSize: values.lotSize,
        stopLoss: values.stopLoss,
        takeProfit: values.takeProfit,
        riskPercentage: 0,
        returnPercentage: 0,
        profitLoss: profitLoss,
        durationMinutes: values.durationMinutes,
        notes: values.notes || '',
        date: values.date.toISOString().split('T')[0],
        account: 'Main Trading',
        imageUrl: null,
        beforeImageUrl: null,
        afterImageUrl: null,
        hashtags: hashtags,
        commission: values.commission || 0,
        rating: values.rating || 0,
        total: profitLoss - (values.commission || 0),
        marketSession: values.marketSession
      });

      toast({
        title: "Trade added",
        description: "Your trade has been successfully added",
      });

      navigate('/trades');
    } catch (error) {
      console.error("Error adding trade:", error);
      toast({
        title: "Error",
        description: "Failed to add trade",
        variant: "destructive",
      });
    }
  };

  // Calculate profit/loss when relevant field values change
  React.useEffect(() => {
    const entry = form.watch('entry');
    const exit = form.watch('exit');
    const lotSize = form.watch('lotSize');
    const type = form.watch('type');
    const pair = form.watch('pair');

    if (entry !== undefined && exit !== undefined && lotSize !== undefined && type && pair) {
      const profitLoss = calculateProfitLoss(entry, exit, lotSize, type, pair);
      // Remove this line that was causing the error - don't set profitLoss directly
      // form.setValue('profitLoss', profitLoss, { shouldDirty: false });
    }
  }, [form.watch('entry'), form.watch('exit'), form.watch('lotSize'), form.watch('type'), form.watch('pair')]);

  if (!showManualForm) {
    return (
      <Layout>
        <div className="container mx-auto py-6 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Add New Trade</h1>
            <p className="text-gray-500">Choose how you want to add your trade data</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Add Trade</CardTitle>
              <CardDescription>
                Add a new trade manually or import from a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddTradeButtons 
                onAddManually={() => setShowManualForm(true)} 
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // ... keep existing code (JSX for the manual form)
  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Trade</h1>
            <p className="text-gray-500">Record your trade details</p>
          </div>
          <Button variant="outline" onClick={() => setShowManualForm(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trade Details</CardTitle>
                    <CardDescription>Enter the basic trade information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pair"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trading Pair</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a trading pair" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pairs.map(pair => (
                                <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select trade type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Buy">Buy</SelectItem>
                              <SelectItem value="Sell">Sell</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="entry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entry Price</FormLabel>
                            <FormControl>
                              <Input placeholder="Entry price" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="exit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exit Price</FormLabel>
                            <FormControl>
                              <Input placeholder="Exit price" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lotSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lot Size</FormLabel>
                            <FormControl>
                              <Input placeholder="Lot size" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entry Date</FormLabel>
                            <DatePicker
                              onSelect={field.onChange}
                              defaultValue={field.value}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="stopLoss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stop Loss</FormLabel>
                            <FormControl>
                              <Input placeholder="Stop loss" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="takeProfit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Take Profit</FormLabel>
                            <FormControl>
                              <Input placeholder="Take profit" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="commission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission</FormLabel>
                            <FormControl>
                              <Input placeholder="Commission" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (Minutes)</FormLabel>
                            <FormControl>
                              <Input placeholder="Duration in minutes" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="marketSession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Market Session</FormLabel>
                          <TradingSessionSelector
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                    <CardDescription>Add any extra information about the trade</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Type your notes here."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <HashtagInput 
                      value={hashtags} 
                      onChange={setHashtags} 
                    />
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <StarRating 
                            value={field.value || 0} 
                            onChange={field.onChange} 
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <Button type="submit">Add Trade</Button>
            {/* Make sure to include the ImportTradesDialog component */}
            <ImportTradesDialog
              open={isImportDialogOpen}
              onOpenChange={setIsImportDialogOpen}
            />
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default AddTrade;
