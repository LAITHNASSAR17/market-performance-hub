
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const extractToken = () => {
      // أولاً، نحاول الحصول على الرمز من معلمات البحث
      const resetToken = searchParams.get('reset_token');
      if (resetToken) {
        console.log("Reset token found in URL params:", resetToken);
        setToken(resetToken);
        return true;
      }
      
      // ثانياً، نحاول استخراج الرمز من hash
      // نستخدم URL hash params للتعامل مع hash في الرابط
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        console.log("Access token found from hash:", accessToken);
        setToken(accessToken);
        return true;
      }
      
      // نحاول طريقة أخرى للحصول على الرمز من hash
      const fullHash = location.hash;
      if (fullHash && fullHash.includes('access_token=')) {
        const tokenMatch = fullHash.match(/access_token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          console.log("Access token extracted manually:", tokenMatch[1]);
          setToken(tokenMatch[1]);
          return true;
        }
      }
      
      return false;
    };

    const hasToken = extractToken();
    
    if (!hasToken) {
      console.error("No reset token found in URL or hash");
      toast({
        title: "خطأ في الرابط",
        description: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      // تحقق من صلاحية الرمز
      const verifyToken = async () => {
        try {
          const { error } = await supabase.auth.getUser(token);
          if (error) {
            console.error("Token verification error:", error);
            toast({
              title: "الرمز غير صالح",
              description: "رمز إعادة التعيين غير صالح أو منتهي الصلاحية.",
              variant: "destructive",
            });
            navigate('/login');
          }
        } catch (err) {
          console.error("Error verifying token:", err);
        }
      };
      
      verifyToken();
    }
  }, [location, navigate, searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    try {
      if (!token) {
        throw new Error("لا يوجد رمز إعادة تعيين");
      }
      
      // نستخدم رمز الوصول لإعادة تعيين كلمة المرور
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
      });
      
      // ننتقل إلى صفحة تسجيل الدخول بعد إعادة تعيين كلمة المرور بنجاح
      navigate('/login');
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription className="text-center">
            أدخل كلمة المرور الجديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <div className="mb-4">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Lock className="h-4 w-4 mx-3 text-gray-500" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
              <div className="flex items-center border border-input rounded-md mt-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Lock className="h-4 w-4 mx-3 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="تأكيد كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'جارٍ إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
