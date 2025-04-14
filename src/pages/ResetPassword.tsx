
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
  const [signedOut, setSignedOut] = useState(false);
  const [tokenExtracted, setTokenExtracted] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // First step: Sign out any existing user to prevent auto-redirects
  useEffect(() => {
    const performSignOut = async () => {
      try {
        console.log("Signing out any existing user...");
        await supabase.auth.signOut();
        setSignedOut(true);
      } catch (error) {
        console.error("Error signing out:", error);
        // Still mark as done to prevent loops
        setSignedOut(true);
      }
    };
    
    if (!signedOut) {
      performSignOut();
    }
  }, [signedOut]);

  // Second step: Extract token after sign out is complete
  useEffect(() => {
    if (!signedOut || tokenExtracted) return;
    
    const extractResetToken = () => {
      console.log("Extracting reset token...");
      
      // Try method 1: Get from URL query params
      const resetToken = searchParams.get('reset_token');
      if (resetToken) {
        console.log("Reset token found in URL params:", resetToken);
        setToken(resetToken);
        setTokenExtracted(true);
        return;
      }
      
      // Try method 2: Parse from hash directly (Supabase format)
      const hash = location.hash.replace(/^#/, '');
      console.log("Looking for token in hash:", hash);
      
      // Check for recovery flow
      if (hash.includes('type=recovery')) {
        console.log("Recovery flow detected");
        
        // Extract access token from hash
        const accessTokenMatch = hash.match(/access_token=([^&]+)/);
        if (accessTokenMatch && accessTokenMatch[1]) {
          const accessToken = accessTokenMatch[1];
          console.log("Token found in recovery hash:", accessToken);
          setToken(accessToken);
          setTokenExtracted(true);
          return;
        }
      }
      
      // Try method 3: Parse access token directly
      const accessTokenMatch = hash.match(/access_token=([^&]+)/);
      if (accessTokenMatch && accessTokenMatch[1]) {
        const accessToken = accessTokenMatch[1];
        console.log("Access token found in hash:", accessToken);
        setToken(accessToken);
        setTokenExtracted(true);
        return;
      }
      
      // No token found, show error
      console.error("No reset token found in URL or hash");
      setError("لم يتم العثور على رمز إعادة تعيين صالح");
      toast({
        title: "خطأ في الرابط",
        description: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.",
        variant: "destructive",
      });
    };
    
    extractResetToken();
  }, [location, searchParams, toast, signedOut, tokenExtracted]);

  // Verify token is valid
  useEffect(() => {
    if (!token || !tokenExtracted) return;
    
    const verifyToken = async () => {
      try {
        console.log("Verifying token validity...");
        const { error } = await supabase.auth.getUser(token);
        if (error) {
          console.error("Token verification error:", error);
          setError("رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية");
          toast({
            title: "الرمز غير صالح",
            description: "رمز إعادة تعيين غير صالح أو منتهي الصلاحية.",
            variant: "destructive",
          });
          // Delay navigation to show the error
          setTimeout(() => navigate('/login'), 2000);
        } else {
          console.log("Token verified successfully");
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        setError("حدث خطأ أثناء التحقق من صلاحية الرمز");
      }
    };
    
    verifyToken();
  }, [token, tokenExtracted, navigate, toast]);

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
      
      console.log("Updating password...");
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      console.log("Password reset successful");
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
      });
      
      // Sign out to ensure clean state
      await supabase.auth.signOut();
      
      // Navigate to login page after successful reset
      navigate('/login');
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message);
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
          {token ? (
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
              {error ? (
                <div className="text-red-600">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : (
                <div className="animate-pulse">
                  <p>جاري التحقق من رمز إعادة التعيين...</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
