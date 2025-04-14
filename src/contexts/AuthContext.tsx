
  const resetPassword = async (newPassword: string) => {
    try {
      // Password validation
      if (newPassword.length < 8) {
        throw new Error(language === 'ar' 
          ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' 
          : 'Password must be at least 8 characters long');
      }

      // Strong password regex (at least one uppercase, one lowercase, one number)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordRegex.test(newPassword)) {
        throw new Error(language === 'ar' 
          ? 'كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام' 
          : 'Password must include uppercase, lowercase letters and numbers');
      }

      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: language === 'ar' ? "تم تغيير كلمة المرور" : "Password Changed",
        description: language === 'ar' 
          ? "تم تحديث كلمة المرور بنجاح" 
          : "Your password has been successfully updated",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: language === 'ar' ? "فشل تحديث كلمة المرور" : "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
