
import { supabase } from '@/lib/supabase';

export const createDefaultAdmin = async () => {
  try {
    // التحقق من وجود حساب أدمن بالفعل
    const { data: existingAdmins, error: adminCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
    
    if (adminCheckError) {
      console.error('Error checking for admin accounts:', adminCheckError);
      return;
    }
    
    // إذا كان هناك حساب أدمن موجود بالفعل، لا تقم بإنشاء واحد جديد
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('Admin account already exists');
      return;
    }
    
    // إنشاء حساب أدمن جديد
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    console.log('Creating default admin account...');
    
    // 1. إنشاء مستخدم في نظام المصادقة
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword
    });
    
    if (authError) {
      console.error('Error creating admin auth user:', authError);
      return;
    }
    
    if (!authData.user) {
      console.error('No user created');
      return;
    }
    
    // 2. إنشاء ملف التعريف الخاص بالأدمن مع صلاحيات المسؤول
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: 'المدير',
        email: adminEmail,
        role: 'admin',
        is_blocked: false,
        email_verified: true,
        subscription_tier: 'enterprise'
      });
    
    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return;
    }
    
    console.log('Default admin account created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error in createDefaultAdmin:', error);
  }
};
