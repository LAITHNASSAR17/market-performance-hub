
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Extract and validate token on component mount
  useEffect(() => {
    const signOutAndExtractToken = async () => {
      try {
        // 1. First sign out any existing user to prevent auto-redirects
        await supabase.auth.signOut();
        console.log("Signed out any existing user");
        
        // 2. Extract token using multiple methods
        // Method 1: Get from URL query params
        const resetToken = searchParams.get('reset_token');
        if (resetToken) {
          console.log("Token found in URL params:", resetToken);
          setToken(resetToken);
          setProcessing(false);
          return;
        }
        
        // Method 2: Parse from hash (Supabase recovery flow)
        const hash = location.hash.substring(1); // Remove # character
        console.log("Checking hash for token:", hash);
        
        if (hash.includes('type=recovery')) {
          const accessTokenMatch = hash.match(/access_token=([^&]+)/);
          if (accessTokenMatch && accessTokenMatch[1]) {
            console.log("Token found in recovery hash:", accessTokenMatch[1]);
            setToken(accessTokenMatch[1]);
            setProcessing(false);
            return;
          }
        }
        
        // Method 3: Parse access token directly
        const accessTokenMatch = hash.match(/access_token=([^&]+)/);
        if (accessTokenMatch && accessTokenMatch[1]) {
          console.log("Access token found in hash:", accessTokenMatch[1]);
          setToken(accessTokenMatch[1]);
          setProcessing(false);
          return;
        }
        
        // No token found, show error
        console.error("No valid reset token found in URL or hash");
        setError("لم يتم العثور على رمز إعادة تعيين صالح");
        setProcessing(false);
        toast({
          title: "خطأ في الرابط",
          description: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.",
          variant: "destructive",
        });
        
        // Redirect to login after a delay to show the error
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error("Error in token extraction:", err);
        setError("حدث خطأ أثناء استخراج الرمز");
        setProcessing(false);
      }
    };
    
    signOutAndExtractToken();
  }, [location, searchParams, navigate, toast]);

  // Verify token validity
  useEffect(() => {
    if (!token || processing) return;
    
    const verifyToken = async () => {
      try {
        console.log("Verifying token validity...");
        const { error, data } = await supabase.auth.getUser(token);
        
        if (error || !data.user) {
          console.error("Token verification error:", error);
          setError("رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية");
          toast({
            title: "الرمز غير صالح",
            description: "رمز إعادة تعيين غير صالح أو منتهي الصلاحية.",
            variant: "destructive",
          });
          // Redirect to login after delay
          setTimeout(() => navigate('/login'), 3000);
        } else {
          console.log("Token verified successfully");
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        setError("حدث خطأ أثناء التحقق من صلاحية الرمز");
      }
    };
    
    verifyToken();
  }, [token, processing, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      if (!token) {
        throw new Error("لا يوجد رمز إعادة تعيين");
      }
      
      console.log("Updating password with token...");
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      console.log("Password reset successful");
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
      });
      
      // Sign out after successful reset to ensure clean state
      await supabase.auth.signOut();
      
      // Navigate to login page
      navigate('/login');
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور");
    } finally {
      setLoading(false);
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
          {processing ? (
            <div className="text-center p-4">
              <div className="animate-pulse">
                <p>جاري التحقق من رمز إعادة التعيين...</p>
              </div>
            </div>
          ) : token ? (
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
          ) : (
            <div className="text-center p-4">
              <div className="text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error || "رمز إعادة التعيين غير صالح أو منتهي الصلاحية"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
