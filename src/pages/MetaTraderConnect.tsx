
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowDown, Download, Info, ExternalLink } from 'lucide-react';

const MetaTraderConnect: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [brokerApiKey, setBrokerApiKey] = useState('');
  const [brokerAccountId, setBrokerAccountId] = useState('');
  const [brokerPassword, setBrokerPassword] = useState('');
  const [brokerServer, setBrokerServer] = useState('');
  const [platform, setPlatform] = useState<'mt4' | 'mt5'>('mt5');

  const handleConnectMetaTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "خطأ في المصادقة",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!brokerApiKey || !brokerAccountId || !brokerServer) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Store connection details in Supabase
      const { data, error } = await supabase
        .from('mt_connections')
        .upsert({
          user_id: user.id,
          account_id: brokerAccountId,
          api_key: brokerApiKey,
          password: brokerPassword, // Consider encryption for production
          server: brokerServer,
          platform: platform,
          is_active: true,
          last_sync: null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم الاتصال بنجاح",
        description: "تم ربط حساب MetaTrader الخاص بك بنجاح",
      });
      
      // Try to import trades immediately
      await importTradesFromMetaTrader();
      
    } catch (error: any) {
      console.error('Error connecting MetaTrader account:', error);
      toast({
        title: "فشل الاتصال",
        description: error.message || "حدث خطأ أثناء ربط حساب MetaTrader",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const importTradesFromMetaTrader = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Call our edge function to fetch trades from MetaTrader
      const { data, error } = await supabase.functions.invoke('fetch-mt-trades', {
        body: { 
          userId: user.id 
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "تم استيراد الصفقات بنجاح",
          description: `تم استيراد ${data.importedCount} صفقة من حساب MetaTrader الخاص بك`,
        });
        
        // Navigate to trades page to see the imported trades
        navigate('/trades');
      } else {
        throw new Error(data.message || "فشل استيراد الصفقات");
      }
    } catch (error: any) {
      console.error('Error importing trades:', error);
      toast({
        title: "فشل استيراد الصفقات",
        description: error.message || "حدث خطأ أثناء استيراد الصفقات من MetaTrader",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold">ربط حساب MetaTrader</h1>
        <p className="text-gray-500">
          قم بربط حساب MetaTrader 4 أو 5 الخاص بك لاستيراد صفقاتك تلقائيًا
        </p>
      </div>

      <div className="grid gap-6">
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="connect">ربط الحساب</TabsTrigger>
            <TabsTrigger value="import">استيراد الصفقات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect">
            <Card>
              <CardHeader>
                <CardTitle>ربط حساب MetaTrader</CardTitle>
                <CardDescription>
                  أدخل تفاصيل حساب MetaTrader الخاص بك للاتصال
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConnectMetaTrader} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">المنصة</Label>
                    <Select 
                      value={platform} 
                      onValueChange={(value: 'mt4' | 'mt5') => setPlatform(value)}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="اختر المنصة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mt4">MetaTrader 4</SelectItem>
                        <SelectItem value="mt5">MetaTrader 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountId">رقم الحساب</Label>
                    <Input
                      id="accountId"
                      placeholder="أدخل رقم حساب MetaTrader الخاص بك"
                      value={brokerAccountId}
                      onChange={(e) => setBrokerAccountId(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">
                      مفتاح API
                      <span className="text-xs text-gray-500 inline-block mr-2">
                        (يمكنك الحصول عليه من وسيط التداول الخاص بك)
                      </span>
                    </Label>
                    <Input
                      id="apiKey"
                      placeholder="أدخل مفتاح API"
                      value={brokerApiKey}
                      onChange={(e) => setBrokerApiKey(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور (اختياري)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="أدخل كلمة مرور حساب MetaTrader"
                      value={brokerPassword}
                      onChange={(e) => setBrokerPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="server">اسم السيرفر</Label>
                    <Input
                      id="server"
                      placeholder="مثال: ICMarketsSC-Demo"
                      value={brokerServer}
                      onChange={(e) => setBrokerServer(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-blue-700 mb-1">أين تجد معلومات الاتصال؟</h4>
                        <p className="text-sm text-blue-600">
                          يمكنك الحصول على مفتاح API واسم السيرفر من وسيط التداول الخاص بك.
                          تواصل مع دعم الوسيط للحصول على المعلومات اللازمة لربط حسابك.
                        </p>
                        <Button variant="link" className="text-blue-600 p-0 h-auto mt-1" asChild>
                          <a href="https://www.mql5.com/en/docs/integration/python_metatrader5" target="_blank" rel="noopener noreferrer">
                            معرفة المزيد
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={loading}>
                      {loading ? "جاري الاتصال..." : "ربط الحساب"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>استيراد الصفقات من MetaTrader</CardTitle>
                <CardDescription>
                  استيراد صفقاتك من حساب MetaTrader المرتبط
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <ArrowDown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">استيراد صفقاتك</h3>
                  <p className="text-gray-500 mb-6">
                    قم باستيراد جميع صفقاتك من حساب MetaTrader المرتبط بنقرة واحدة
                  </p>
                  <Button 
                    onClick={importTradesFromMetaTrader} 
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "جاري الاستيراد..." : "استيراد الصفقات الآن"}
                  </Button>
                </div>
                
                <div className="text-sm text-gray-500 mt-2">
                  <p>ملاحظة: سيتم استيراد صفقاتك المكتملة فقط من حساب MetaTrader. الصفقات المفتوحة لن يتم استيرادها.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MetaTraderConnect;
