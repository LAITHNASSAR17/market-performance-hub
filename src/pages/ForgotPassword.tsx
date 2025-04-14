
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      console.log('ForgotPassword: Sending password reset email to:', email);
      const response = await sendPasswordResetEmail(email);
      console.log('ForgotPassword: Response from sendPasswordResetEmail:', response);
      
      if (response && !response.error) {
        setEmailSent(true);
        toast({
          title: "تم إرسال البريد الإلكتروني",
          description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        });
      }
    } catch (error) {
      console.error('ForgotPassword: Error in password reset:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال بريد إعادة تعيين كلمة المرور. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle>إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription>
              {emailSent 
                ? "تم إرسال رابط إعادة تعيين كلمة المرور. يرجى التحقق من بريدك الإلكتروني."
                : "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Mail className="h-4 w-4 mx-3 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </Button>
              </form>
            ) : (
              <div className="text-center p-4">
                <Mail className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong>. 
                  يرجى التحقق من بريدك الإلكتروني واتباع التعليمات.
                </p>
                <Button 
                  onClick={() => setEmailSent(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  إرسال مرة أخرى
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
