import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Plus, X } from "lucide-react";
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import StarRating from '@/components/StarRating';
import { supabase } from '@/lib/supabase';
import AddPairDialog from '@/components/AddPairDialog';
import ImageUpload from '@/components/ImageUpload';

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrade, updateTrade, addTrade, pairs, accounts, allHashtags, addHashtag } = useTrade();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPairDialog, setShowAddPairDialog] = useState(false);
  
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
  const [account, setAccount] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [profitLoss, setProfitLoss] = useState<string>('0');
  const [commission, setCommission] = useState('0');
  const [rating, setRating] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [isMultipleTrades, setIsMultipleTrades] = useState(false);
  const [tradesCount, setTradesCount] = useState('1');
  
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
        
        if (data.entry_date) {
          setDate(data.entry_date.split('T')[0]);
        }
        
        setStopLoss(data.stop_loss?.toString() || '');
        setTakeProfit(data.take_profit?.toString() || '');
        setDurationMinutes(data.duration_minutes?.toString() || '');
        setNotes(data.notes || '');
        setHashtags(data.tags || []);
        setProfitLoss(data.profit_loss?.toString() || '0');
        setCommission(data.fees?.toString() || '0');
        setRating(data.rating || 0);
        setImageUrl(data.image_url || null);
        setBeforeImageUrl(data.before_image_url || null);
        setAfterImageUrl(data.after_image_url || null);
        setIsMultipleTrades(data.is_multiple_trades || false);
        setTradesCount(data.trades_count?.toString() || '1');
        
        setAccount(accounts[0] || '');
        setIsEditing(true);
        console.log("Trade data loaded:", data);
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
  
  useEffect(() => {
    if (id) {
      fetchTradeFromDb(id);
    } else {
      setAccount(accounts[0] || '');
    }
  }, [id, accounts]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pair || !type || !entry || !date || !account || !profitLoss) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة، خاصة الربح/الخسارة",
        variant: "destructive"
      });
      return;
    }

    try {
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
        riskPercentage: 0,
        returnPercentage: 0,
        imageUrl,
        beforeImageUrl,
        afterImageUrl,
        commission: parseFloat(commission) || 0,
        rating,
        isMultipleTrades,
        tradesCount: isMultipleTrades ? parseInt(tradesCount) : 1
      };

      if (isEditing && id) {
        await updateTrade(id, tradeData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث التداول بنجاح",
        });
      } else {
        await addTrade(tradeData);
        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة التداول بنجاح",
        });
      }
      
      navigate('/trades');
    } catch (error) {
      console.error('Error saving trade:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التداول",
        variant: "destructive"
      });
    }
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
          العودة
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'تعديل التداول' : 'إضافة تداول جديد'}</h1>
        <p className="text-gray-500">
          {isEditing 
            ? 'قم بتحديث تفاصيل التداول الخاص بك' 
            : 'سجل تداول جديد مع جميع التفاصيل ذات الصلة'}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>جاري تحميل بيانات التداول...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">تفاصيل التداول</CardTitle>
                <CardDescription>أدخل المعلومات الأساسية حول التداول الخاص بك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pair">زوج التداول/الرمز</Label>
                    {isEditing ? (
                      <Input 
                        id="pair" 
                        value={pair} 
                        readOnly 
                        className="bg-gray-100 border border-gray-300"
                      />
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select value={pair} onValueChange={setPair} required>
                            <SelectTrigger id="pair">
                              <SelectValue placeholder="اختر الزوج" />
                            </SelectTrigger>
                            <SelectContent>
                              {pairs.map(p => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                              <SelectItem value="add-new" className="text-primary font-semibold">
                                + إضافة زوج جديد
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="px-3" 
                          onClick={() => setShowAddPairDialog(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account">حساب التداول</Label>
                    <Select value={account} onValueChange={setAccount} required>
                      <SelectTrigger id="account">
                        <SelectValue placeholder="اختر الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع التداول</Label>
                    <Select value={type} onValueChange={(value: 'Buy' | 'Sell') => setType(value)} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">شراء (طويل)</SelectItem>
                        <SelectItem value="Sell">بيع (قصير)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">تاريخ التداول</Label>
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
                <CardTitle className="text-lg">معلومات السعر</CardTitle>
                <CardDescription>أدخل سعر الدخول والخروج وتفاصيل إدارة المخاطر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="entry">سعر الدخول</Label>
                    <Input 
                      id="entry" 
                      type="number" 
                      step="any" 
                      value={entry} 
                      onChange={(e) => setEntry(e.target.value)} 
                      required
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exit">سعر الخروج</Label>
                    <Input 
                      id="exit" 
                      type="number" 
                      step="any" 
                      value={exit} 
                      onChange={(e) => setExit(e.target.value)} 
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">حجم العقد</Label>
                    <Input 
                      id="lotSize" 
                      type="number" 
                      step="any" 
                      value={lotSize} 
                      onChange={(e) => setLotSize(e.target.value)} 
                      required
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">وقف الخسارة</Label>
                    <Input 
                      id="stopLoss" 
                      type="number" 
                      step="any" 
                      value={stopLoss} 
                      onChange={(e) => setStopLoss(e.target.value)} 
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">هدف الربح</Label>
                    <Input 
                      id="takeProfit" 
                      type="number" 
                      step="any" 
                      value={takeProfit} 
                      onChange={(e) => setTakeProfit(e.target.value)} 
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profitLoss">الربح/الخسارة</Label>
                    <Input 
                      id="profitLoss" 
                      type="number" 
                      step="any" 
                      value={profitLoss} 
                      onChange={(e) => setProfitLoss(e.target.value)}
                      required
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">المدة (بالدقائق)</Label>
                    <Input 
                      id="durationMinutes" 
                      type="number" 
                      value={durationMinutes} 
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commission">العمولة/الرسوم</Label>
                    <Input 
                      id="commission" 
                      type="number" 
                      step="any" 
                      value={commission} 
                      onChange={(e) => setCommission(e.target.value)} 
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="isMultipleTrades" 
                        checked={isMultipleTrades}
                        onCheckedChange={(checked) => {
                          setIsMultipleTrades(checked === true);
                          if (checked !== true) {
                            setTradesCount('1');
                          }
                        }}
                      />
                      <Label htmlFor="isMultipleTrades" className="mr-2">صفقات متعددة</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tradesCount" className={isMultipleTrades ? "" : "text-gray-400"}>عدد الصفقات</Label>
                      <Select 
                        value={tradesCount} 
                        onValueChange={setTradesCount}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر عدد الصفقات" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} صفقة
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">صور التداول</CardTitle>
                <CardDescription>أضف صورًا للإعداد والدخول والخروج من التداول</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>صورة قبل الدخول</Label>
                    <ImageUpload 
                      value={beforeImageUrl} 
                      onChange={setBeforeImageUrl}
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>صورة بعد الخروج</Label>
                    <ImageUpload 
                      value={afterImageUrl} 
                      onChange={setAfterImageUrl}
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>صورة أخرى</Label>
                    <ImageUpload 
                      value={imageUrl} 
                      onChange={setImageUrl}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">تقييم التداول</CardTitle>
                <CardDescription>قيّم جودة تنفيذ هذا التداول</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">كيف تقيّم هذا التداول؟</p>
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
                <CardTitle className="text-lg">الملاحظات والوسوم</CardTitle>
                <CardDescription>أضف ملاحظات وصنّف تداولك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات التداول</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="أضف ملاحظات حول تداولك، الاستراتيجية المستخدمة، والملاحظات..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>الوسوم</Label>
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
                      placeholder="أضف وسمًا..." 
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
                      إضافة
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">وسوم مقترحة:</p>
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
              إلغاء
            </Button>
            <Button 
              type="submit"
            >
              {isEditing ? 'تحديث التداول' : 'إضافة التداول'}
            </Button>
          </div>
        </form>
      )}
      
      <AddPairDialog 
        isOpen={showAddPairDialog}
        onClose={() => setShowAddPairDialog(false)}
        onPairAdded={(newSymbol) => {
          setPair(newSymbol);
          setShowAddPairDialog(false);
        }}
      />
    </Layout>
  );
};

export default AddTrade;
