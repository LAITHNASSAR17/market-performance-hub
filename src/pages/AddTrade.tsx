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
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, PlusIcon, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { userService } from '@/services/userService';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AddTrade: React.FC = () => {
  const { 
    addTrade, 
    accounts, 
    allHashtags,
    tradingAccounts,
    fetchTradingAccounts
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
    hashtags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    balance: 0
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTradingAccounts();
    }
  }, [user, fetchTradingAccounts]);

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
      date: formData.date.toISOString().split('T')[0]
    };
    
    addTrade(tradeData);
    toast({
      title: "Trade Added",
      description: "Your trade has been added successfully",
    });
    navigate('/trades');
  };

  const handleCreateAccount = async () => {
    if (!user) {
      setAccountError("يجب تسجيل الدخول لإنشاء حساب");
      return;
    }

    if (!newAccountData.name || newAccountData.name.trim() === '') {
      setAccountError("الرجاء إدخال اسم الحساب");
      return;
    }

    setIsCreatingAccount(true);
    setAccountError(null);

    try {
      const newAccount = await userService.createTradingAccount(
        user.id, 
        newAccountData.name, 
        Number(newAccountData.balance)
      );
      
      await fetchTradingAccounts();
      
      setFormData(prev => ({
        ...prev,
        account: newAccount.name
      }));
      
      setNewAccountData({ name: '', balance: 0 });
      setIsAccountDialogOpen(false);
      
      toast({
        title: "تم بنجاح",
        description: `تم إنشاء حساب ${newAccountData.name} بنجاح`,
      });
    } catch (error: any) {
      console.error('Failed to create account', error);
      
      let errorMessage = "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى";
      
      if (error?.message) {
        errorMessage = `فشل إنشاء الحساب: ${error.message}`;
      }
      
      setAccountError(errorMessage);
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreatingAccount(false);
    }
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
                <div className="flex items-center space-x-2">
                  <Select
                    value={formData.account}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, account: value }))}
                  >
                    <SelectTrigger className={errors.account ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {tradingAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.name}>
                            {account.name} (Balance: ${account.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إنشاء حساب جديد</DialogTitle>
                      </DialogHeader>
                      
                      {accountError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>خطأ</AlertTitle>
                          <AlertDescription>{accountError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <Label>اسم الحساب</Label>
                          <Input
                            value={newAccountData.name}
                            onChange={(e) => setNewAccountData(prev => ({ 
                              ...prev, 
                              name: e.target.value 
                            }))}
                            placeholder="مثال: الحساب الرئيسي"
                          />
                        </div>
                        <div>
                          <Label>ا��رصيد الأولي</Label>
                          <Input
                            type="number"
                            value={newAccountData.balance}
                            onChange={(e) => setNewAccountData(prev => ({ 
                              ...prev, 
                              balance: Number(e.target.value) 
                            }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex justify-between">
                          <Button 
                            onClick={handleCreateAccount} 
                            disabled={isCreatingAccount}
                          >
                            {isCreatingAccount ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري الإنشاء...
                              </>
                            ) : 'إنشاء'}
                          </Button>
                          <DialogClose asChild>
                            <Button variant="outline">
                              إلغاء
                            </Button>
                          </DialogClose>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
