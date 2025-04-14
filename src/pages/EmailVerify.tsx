
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, LineChart, AlertCircle } from 'lucide-react';

const EmailVerify = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email) {
        console.error('No email provided in URL');
        setStatus('error');
        setErrorMessage('لم يتم توفير البريد الإلكتروني في الرابط');
        return;
      }

      try {
        console.log(`Attempting to verify email: ${email}`);
        
        // 1. التحقق من وجود المستخدم
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (userError) {
          console.error('Error finding user:', userError);
          setStatus('error');
          setErrorMessage(`خطأ في العثور على المستخدم: ${userError.message}`);
          return;
        }

        if (!userData) {
          console.error('No user found with this email');
          setStatus('error');
          setErrorMessage('لم يتم العثور على حساب بهذا البريد الإلكتروني');
          return;
        }

        console.log('User found:', userData.id);

        // 2. إضافة حقل email_verified إذا لم يكن موجودًا بعد
        try {
          // 3. تحديث حالة التحقق للمستخدم
          const { error: updateError } = await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('email', email);

          if (updateError) {
            console.error('Error updating verification status:', updateError);
            setStatus('error');
            setErrorMessage(`حدث خطأ أثناء تحديث حالة التحقق: ${updateError.message}`);
            return;
          }

          console.log('Email verification successful');
          // نجاح التحقق
          setStatus('success');
          
          toast({
            title: "تم التحقق بنجاح",
            description: "تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.",
          });
          
          // بعد 3 ثوانٍ، انتقل إلى صفحة تسجيل الدخول
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } catch (err) {
          console.error('Unexpected error during update:', err);
          setStatus('error');
          setErrorMessage('حدث خطأ غير متوقع أثناء تحديث حالة التحقق');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setErrorMessage('حدث خطأ غير متوقع أثناء التحقق من البريد الإلكتروني');
      }
    };

    verifyEmail();
  }, [email, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-500 p-3 rounded-full">
            <LineChart className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">التحقق من البريد الإلكتروني</CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && 'جاري التحقق من بريدك الإلكتروني...'}
              {status === 'success' && 'تم التحقق من بريدك الإلكتروني بنجاح!'}
              {status === 'error' && 'فشل التحقق من البريد الإلكتروني'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">يرجى الانتظار بينما يتم التحقق من بريدك الإلكتروني</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="mt-4 text-gray-700">تم التحقق من بريدك الإلكتروني بنجاح.</p>
                <p className="text-sm text-gray-500 mt-2">سيتم توجيهك إلى صفحة تسجيل الدخول خلال لحظات...</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="mt-4 text-red-700">{errorMessage}</p>
                <p className="text-sm text-gray-500 mt-2">يرجى التحقق من الرابط أو المحاولة مرة أخرى.</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              العودة إلى تسجيل الدخول
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerify;
