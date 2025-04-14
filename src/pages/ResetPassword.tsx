
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
  const [processingReset, setProcessingReset] = useState(false);
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Force sign out when accessing this page to prevent automatic redirects
  useEffect(() => {
    const preventAutoRedirect = async () => {
      try {
        await supabase.auth.signOut();
        console.log("Signed out user to prevent automatic redirect");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };
    
    preventAutoRedirect();
  }, []);

  useEffect(() => {
    if (tokenProcessed) return; // Only process token once
    
    const extractToken = () => {
      // First try to get token from URL search params
      const resetToken = searchParams.get('reset_token');
      if (resetToken) {
        console.log("Reset token found in URL params:", resetToken);
        setToken(resetToken);
        setTokenProcessed(true);
        return true;
      }
      
      // Then try to extract token from hash
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        console.log("Access token found from hash:", accessToken);
        setToken(accessToken);
        setTokenProcessed(true);
        return true;
      }
      
      // Try another method to get token from hash
      const fullHash = location.hash;
      if (fullHash && fullHash.includes('access_token=')) {
        const tokenMatch = fullHash.match(/access_token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          console.log("Access token extracted manually:", tokenMatch[1]);
          setToken(tokenMatch[1]);
          setTokenProcessed(true);
          return true;
        }
      }
      
      return false;
    };

    // Only run token extraction if we haven't processed it yet
    if (!tokenProcessed) {
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
        // Verify token without logging in
        const verifyToken = async () => {
          try {
            const { error } = await supabase.auth.getUser(token);
            if (error) {
              console.error("Token verification error:", error);
              toast({
                title: "الرمز غير صالح",
                description: "رمز إعادة تعيين غير صالح أو منتهي الصلاحية.",
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
    }
  }, [location, navigate, searchParams, toast, tokenProcessed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessingReset(true);

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setProcessingReset(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      setProcessingReset(false);
      return;
    }

    try {
      if (!token) {
        throw new Error("لا يوجد رمز إعادة تعيين");
      }
      
      // Use the token to update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
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
      setProcessingReset(false);
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
              disabled={loading || processingReset}
            >
              {processingReset ? 'جارٍ إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
