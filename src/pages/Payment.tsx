
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { initializeMongoDB } from '@/lib/mongodbInit';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState('');
  const [dbConnecting, setDbConnecting] = useState(true);

  useEffect(() => {
    // Check MongoDB connection on component mount
    const checkDBConnection = async () => {
      try {
        setDbConnecting(true);
        const isConnected = await initializeMongoDB();
        setDbStatus(isConnected ? 'Connected to MongoDB' : 'Failed to connect to MongoDB');
      } catch (error) {
        console.error('MongoDB connection error:', error);
        setDbStatus('Failed to connect to MongoDB');
      } finally {
        setDbConnecting(false);
      }
    };
    
    checkDBConnection();
  }, []);

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
      // Simulate payment process
      setTimeout(() => {
        toast({
          title: "تمت عملية الدفع بنجاح",
          description: `تم دفع ${amount} بنجاح`,
        });
        setLoading(false);
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
        {dbConnecting ? (
          <div className="p-2 mb-4 text-sm rounded bg-blue-100 text-blue-800">
            جاري الاتصال بقاعدة البيانات...
          </div>
        ) : dbStatus && (
          <div className={`p-2 mb-4 text-sm rounded ${dbStatus.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {dbStatus}
          </div>
        )}
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
                  هذه واجهة تجريبية. في الإصدار الكامل، ستتم معالجة المدفوعات وتخزينها في قاعدة بيانات MongoDB.
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
