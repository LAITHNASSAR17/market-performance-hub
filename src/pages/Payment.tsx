
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "خطأ في المبلغ",
        description: "يرجى إدخال مبلغ صالح للدفع",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // في بيئة الإنتاج، هنا ستقوم بالاتصال بخادمك لإنشاء جلسة Stripe
      // وسيقوم الخادم بإنشاء دفعة وإرجاع clientSecret
      
      // مثال تجريبي للتوضيح:
      setTimeout(() => {
        toast({
          title: "تمت عملية الدفع بنجاح",
          description: `تم دفع ${amount} بنجاح`,
        });
        setLoading(false);
        // بعد الدفع الناجح، يمكن توجيه المستخدم إلى صفحة التأكيد
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "فشل في عملية الدفع",
        description: "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto my-8 max-w-lg">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-right">بوابة الدفع</CardTitle>
            <CardDescription className="text-right">قم بإدخال التفاصيل لإتمام عملية الدفع</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-right block">المبلغ</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="أدخل المبلغ"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-right"
                  min="1"
                  required
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-center text-gray-500 text-sm">
                  هذه واجهة تجريبية. لتكامل الدفع الكامل، تحتاج إلى إعداد خادم خلفي (backend) لمعالجة المدفوعات بشكل آمن.
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handlePayment} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'جاري معالجة الدفع...' : 'إتمام عملية الدفع'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Payment;
