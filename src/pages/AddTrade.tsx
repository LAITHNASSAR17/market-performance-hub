import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckCheck, ChevronsUpDown, ImagePlus, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useTrade } from '@/contexts/TradeContext';
import { useTags } from '@/contexts/TagsContext';
import HashtagBadge from '@/components/HashtagBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionFeatures } from '@/hooks/useSubscriptionFeatures';

interface TradeFormValues {
  pair: string;
  account: string;
  type: 'Buy' | 'Sell';
  date: Date;
  durationMinutes: number;
  entry: number;
  exit: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  riskPercentage: number;
  profitLoss: number;
  returnPercentage: number;
  notes: string;
  hashtags: string[];
  imageUrl?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  rating?: number;
}

const tradeSchema = yup.object().shape({
  pair: yup.string().required('Trading pair is required'),
  account: yup.string().required('Account is required'),
  type: yup.string().oneOf(['Buy', 'Sell']).required('Trade type is required'),
  date: yup.date().required('Date is required'),
  durationMinutes: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
  entry: yup.number().required('Entry price is required'),
  exit: yup.number().required('Exit price is required'),
  stopLoss: yup.number().notRequired(),
  takeProfit: yup.number().notRequired(),
  lotSize: yup.number().required('Lot size is required').min(0.01, 'Lot size must be at least 0.01'),
  riskPercentage: yup.number().required('Risk percentage is required').min(0, 'Risk must be between 0 and 100').max(100, 'Risk must be between 0 and 100'),
  profitLoss: yup.number().required('Profit/Loss is required'),
  returnPercentage: yup.number().required('Return percentage is required'),
  notes: yup.string().notRequired(),
  hashtags: yup.array().of(yup.string()).notRequired(),
  imageUrl: yup.string().notRequired(),
  beforeImageUrl: yup.string().notRequired(),
  afterImageUrl: yup.string().notRequired(),
  rating: yup.number().notRequired(),
});

const AddTrade: React.FC = () => {
  const { getImageLimit, canUseFeature } = useSubscriptionFeatures();
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: yupResolver(tradeSchema),
  });
  const { addTrade, updateTrade, getTrade } = useTrade();
  const { tags, addTag } = useTags();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | undefined>(undefined);
  const [afterImageUrl, setAfterImageUrl] = useState<string | undefined>(undefined);
  const [trade, setTrade] = useState<any>(null);
  const [isStopLossEnabled, setIsStopLossEnabled] = useState(false);
  const [isTakeProfitEnabled, setIsTakeProfitEnabled] = useState(false);

  React.useEffect(() => {
    if (id) {
      const existingTrade = getTrade(id);
      if (existingTrade) {
        setTrade(existingTrade);
        setValue('pair', existingTrade.pair);
        setValue('account', existingTrade.account);
        setValue('type', existingTrade.type);
        setValue('date', new Date(existingTrade.date));
        setValue('durationMinutes', existingTrade.durationMinutes);
        setValue('entry', existingTrade.entry);
        setValue('exit', existingTrade.exit);
        setValue('stopLoss', existingTrade.stopLoss);
        setValue('takeProfit', existingTrade.takeProfit);
        setValue('lotSize', existingTrade.lotSize);
        setValue('riskPercentage', existingTrade.riskPercentage);
        setValue('profitLoss', existingTrade.profitLoss);
        setValue('returnPercentage', existingTrade.returnPercentage);
        setValue('notes', existingTrade.notes);
        setSelectedTags(existingTrade.hashtags);
        setImageUrl(existingTrade.imageUrl);
        setBeforeImageUrl(existingTrade.beforeImageUrl);
        setAfterImageUrl(existingTrade.afterImageUrl);
        setIsStopLossEnabled(existingTrade.stopLoss !== undefined);
        setIsTakeProfitEnabled(existingTrade.takeProfit !== undefined);
      }
    }
  }, [id, getTrade, setValue]);

  const onSubmit = (data: TradeFormValues) => {
    const tradeData = {
      ...data,
      hashtags: selectedTags,
      imageUrl,
      beforeImageUrl,
      afterImageUrl,
      stopLoss: isStopLossEnabled ? data.stopLoss : undefined,
      takeProfit: isTakeProfitEnabled ? data.takeProfit : undefined,
    };

    if (id) {
      updateTrade(id, tradeData);
      toast({
        title: "Trade Updated",
        description: "Your trade has been updated successfully",
      });
    } else {
      addTrade(tradeData);
      toast({
        title: "Trade Added",
        description: "Your trade has been added successfully",
      });
    }
    navigate('/trades');
  };

  const handleAddTag = async () => {
    if (newTag && !tags.includes(newTag)) {
      await addTag(newTag);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleImageUpload = (type: 'before' | 'after' | 'chart') => {
    const imageLimit = getImageLimit();
    const currentImages = [beforeImageUrl, afterImageUrl, imageUrl].filter(Boolean).length;
    
    if (currentImages >= imageLimit) {
      toast({
        title: "Image limit reached",
        description: `Your subscription allows up to ${imageLimit} images per trade`,
        variant: "destructive"
      });
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64Image = e.target.result;
          switch (type) {
            case 'before':
              setBeforeImageUrl(base64Image);
              break;
            case 'after':
              setAfterImageUrl(base64Image);
              break;
            case 'chart':
              setImageUrl(base64Image);
              break;
            default:
              break;
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRemoveImage = (type: 'before' | 'after' | 'chart') => {
    switch (type) {
      case 'before':
        setBeforeImageUrl(undefined);
        break;
      case 'after':
        setAfterImageUrl(undefined);
        break;
      case 'chart':
        setImageUrl(undefined);
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{id ? 'Edit Trade' : 'Add New Trade'}</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your trade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pair">Trading Pair</Label>
                  <Input
                    type="text"
                    id="pair"
                    placeholder="e.g., EUR/USD"
                    {...register('pair')}
                  />
                  {errors.pair && <p className="text-red-500 text-sm mt-1">{errors.pair.message}</p>}
                </div>
                <div>
                  <Label htmlFor="account">Account</Label>
                  <Input
                    type="text"
                    id="account"
                    placeholder="e.g., My Broker Account"
                    {...register('account')}
                  />
                  {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account.message}</p>}
                </div>
                <div>
                  <Label htmlFor="type">Trade Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue="Buy"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trade type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Buy">Buy</SelectItem>
                          <SelectItem value="Sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                </div>
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !trade?.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {trade?.date ? (
                          format(new Date(trade.date), "MMMM dd, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                          <Calendar
                            mode="single"
                            defaultMonth={new Date()}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date()
                            }
                            initialFocus
                          />
                        )}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    type="number"
                    id="durationMinutes"
                    placeholder="e.g., 60"
                    {...register('durationMinutes', { valueAsNumber: true })}
                  />
                  {errors.durationMinutes && <p className="text-red-500 text-sm mt-1">{errors.durationMinutes.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Points</CardTitle>
                <CardDescription>Enter the price points for your trade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="entry">Entry Price</Label>
                  <Input
                    type="number"
                    id="entry"
                    placeholder="e.g., 1.1050"
                    {...register('entry', { valueAsNumber: true })}
                  />
                  {errors.entry && <p className="text-red-500 text-sm mt-1">{errors.entry.message}</p>}
                </div>
                <div>
                  <Label htmlFor="exit">Exit Price</Label>
                  <Input
                    type="number"
                    id="exit"
                    placeholder="e.g., 1.1075"
                    {...register('exit', { valueAsNumber: true })}
                  />
                  {errors.exit && <p className="text-red-500 text-sm mt-1">{errors.exit.message}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="stopLoss" checked={isStopLossEnabled} onCheckedChange={setIsStopLossEnabled} />
                  <Label htmlFor="stopLoss">Enable Stop Loss</Label>
                </div>

                {isStopLossEnabled && (
                  <div>
                    <Label htmlFor="stopLoss">Stop Loss Price</Label>
                    <Input
                      type="number"
                      id="stopLoss"
                      placeholder="e.g., 1.1025"
                      {...register('stopLoss', { valueAsNumber: true })}
                    />
                    {errors.stopLoss && <p className="text-red-500 text-sm mt-1">{errors.stopLoss.message}</p>}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="takeProfit" checked={isTakeProfitEnabled} onCheckedChange={setIsTakeProfitEnabled} />
                  <Label htmlFor="takeProfit">Enable Take Profit</Label>
                </div>

                {isTakeProfitEnabled && (
                  <div>
                    <Label htmlFor="takeProfit">Take Profit Price</Label>
                    <Input
                      type="number"
                      id="takeProfit"
                      placeholder="e.g., 1.1100"
                      {...register('takeProfit', { valueAsNumber: true })}
                    />
                    {errors.takeProfit && <p className="text-red-500 text-sm mt-1">{errors.takeProfit.message}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk & Reward</CardTitle>
                <CardDescription>Enter the risk and reward details for your trade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lotSize">Lot Size</Label>
                  <Input
                    type="number"
                    id="lotSize"
                    placeholder="e.g., 0.01"
                    step="0.01"
                    {...register('lotSize', { valueAsNumber: true })}
                  />
                  {errors.lotSize && <p className="text-red-500 text-sm mt-1">{errors.lotSize.message}</p>}
                </div>
                <div>
                  <Label htmlFor="riskPercentage">Risk Percentage</Label>
                  <Input
                    type="number"
                    id="riskPercentage"
                    placeholder="e.g., 1"
                    {...register('riskPercentage', { valueAsNumber: true })}
                  />
                  {errors.riskPercentage && <p className="text-red-500 text-sm mt-1">{errors.riskPercentage.message}</p>}
                </div>
                <div>
                  <Label htmlFor="profitLoss">Profit/Loss</Label>
                  <Input
                    type="number"
                    id="profitLoss"
                    placeholder="e.g., 25.00"
                    {...register('profitLoss', { valueAsNumber: true })}
                  />
                  {errors.profitLoss && <p className="text-red-500 text-sm mt-1">{errors.profitLoss.message}</p>}
                </div>
                <div>
                  <Label htmlFor="returnPercentage">Return Percentage</Label>
                  <Input
                    type="number"
                    id="returnPercentage"
                    placeholder="e.g., 2.5"
                    {...register('returnPercentage', { valueAsNumber: true })}
                  />
                  {errors.returnPercentage && <p className="text-red-500 text-sm mt-1">{errors.returnPercentage.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Add any additional notes or tags for your trade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., This trade was taken based on a strong support level..."
                    {...register('notes')}
                  />
                  {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex items-center space-x-2 mb-2">
                    {tags.map(tag => (
                      <HashtagBadge
                        key={tag}
                        tag={tag}
                        selected={selectedTags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                      />
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingTag(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>

                  {isAddingTag && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="New tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                      />
                      <Button size="sm" onClick={handleAddTag}>Add</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trade Images</CardTitle>
                <CardDescription>Upload before, after, and chart images for your trade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Before Trade Image</Label>
                  {beforeImageUrl ? (
                    <div className="relative">
                      <img src={beforeImageUrl} alt="Before Trade" className="rounded-md max-h-40 object-cover" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                        onClick={() => handleRemoveImage('before')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => handleImageUpload('before')}>
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Upload Before Image
                    </Button>
                  )}
                </div>

                <div>
                  <Label>After Trade Image</Label>
                  {afterImageUrl ? (
                    <div className="relative">
                      <img src={afterImageUrl} alt="After Trade" className="rounded-md max-h-40 object-cover" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                        onClick={() => handleRemoveImage('after')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => handleImageUpload('after')}>
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Upload After Image
                    </Button>
                  )}
                </div>

                <div>
                  <Label>Chart Image</Label>
                  {imageUrl ? (
                    <div className="relative">
                      <img src={imageUrl} alt="Chart" className="rounded-md max-h-40 object-cover" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                        onClick={() => handleRemoveImage('chart')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => handleImageUpload('chart')}>
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Upload Chart Image
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button type="submit">{id ? 'Update Trade' : 'Add Trade'}</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddTrade;
