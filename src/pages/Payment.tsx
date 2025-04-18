
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const selectedTier = sessionStorage.getItem('selected_subscription_tier') || 'premium';

  useEffect(() => {
    // Set amount based on selected tier
    setAmount(selectedTier === 'premium' ? '19' : '49');
  }, [selectedTier]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // في بيئة الإنتاج، هنا سيتم التعامل مع عملية الدفع الفعلية
      setTimeout(() => {
        toast({
          title: "تمت عملية الدفع بنجاح",
          description: `تم دفع $${amount} للاشتراك ${selectedTier === 'premium' ? 'المميز' : 'المتقدم'}`,
        });
        setLoading(false);
        navigate('/payment-success');
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
            <CardDescription className="text-right">
              {selectedTier === 'premium' 
                ? 'الاشتراك في الباقة المميزة' 
                : 'الاشتراك في الباقة المتقدمة'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold">${amount}</div>
              <div className="text-sm text-gray-500">شهرياً</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-center text-gray-500 text-sm">
                هذه واجهة تجريبية. لتكامل الدفع الكامل، تحتاج إلى إعداد خادم خلفي (backend) لمعالجة المدفوعات بشكل آمن.
              </p>
            </div>
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
