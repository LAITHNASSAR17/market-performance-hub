
import { supabase, getUserByEmail, createUserProfile, getAllProfiles, updateUserProfile } from '@/lib/supabase';
import { hashPassword, comparePassword } from '@/utils/encryption';
import { User } from '@/types/auth';
import { ProfileType, createProfileObject } from '@/types/database';

export async function loginUser(email: string, password: string): Promise<ProfileType> {
  console.log('Attempting to login with email:', email);
  
  const userData = await getUserByEmail(email);
  console.log('User data found:', userData ? 'Yes' : 'No');
  
  if (!userData) {
    console.log('User not found for email:', email);
    throw new Error('Invalid credentials');
  }
  
  console.log('Comparing passwords');
  if (userData.password && comparePassword(password, userData.password)) {
    console.log('Password matched');
    
    if (userData.is_blocked) {
      console.log('User is blocked');
      throw new Error('User is blocked');
    }
    
    console.log('Login successful');
    return userData;
  }
  
  console.log('Password did not match');
  throw new Error('Invalid credentials');
}

export async function registerUser(name: string, email: string, password: string, country?: string): Promise<void> {
  try {
    console.log('Registering new user:', email);
    
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('Email already exists:', email);
      throw new Error('البريد الإلكتروني مستخدم بالفعل');
    }
    
    const hashedPassword = hashPassword(password);
    
    // Generate a unique ID for the user
    const userId = self.crypto.randomUUID();
    console.log('Generated user ID:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId, // Add the required ID field
        name,
        email,
        password: hashedPassword,
        role: 'user',
        is_admin: false,
        is_blocked: false,
        email_verified: true,
        country
      });

    if (error) {
      console.error('Supabase error during registration:', error);
      throw error;
    }
    
    console.log('User registered successfully');
    
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// للتجربة سريعا، يمكننا إنشاء حساب اختباري
export async function createTestAccount(): Promise<void> {
  try {
    // تحقق إذا كان الحساب موجود بالفعل
    const email = 'test@example.com';
    const existingUser = await getUserByEmail(email);
    
    if (!existingUser) {
      // إنشاء حساب اختباري جديد
      const userId = self.crypto.randomUUID();
      const hashedPassword = hashPassword('123456');
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: 'حساب اختباري',
          email: email,
          password: hashedPassword,
          role: 'user',
          is_admin: false,
          is_blocked: false,
          email_verified: true,
          country: 'SA'
        });
        
      if (error) throw error;
      console.log('تم إنشاء حساب اختباري بنجاح');
    } else {
      console.log('الحساب الاختباري موجود بالفعل');
    }
  } catch (error) {
    console.error('خطأ في إنشاء الحساب الاختباري:', error);
    throw error;
  }
}

export async function updateUserData(updatedUser: User): Promise<void> {
  try {
    const updateData: Partial<ProfileType> = {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role || updatedUser.isAdmin ? 'admin' : 'user',
      is_blocked: updatedUser.isBlocked || false,
      subscription_tier: updatedUser.subscription_tier || 'free'
    };
    
    await updateUserProfile(updatedUser.id, updateData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function sendEmailVerification(email: string) {
  const verificationLink = `https://trackmind.vip/verify?email=${encodeURIComponent(email)}`;
  
  const response = await supabase.functions.invoke('send-email', {
    body: {
      type: 'verification',
      email,
      verificationLink,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to send verification email');
  }

  return response;
}

export async function sendPasswordReset(email: string) {
  const resetLink = `https://trackmind.vip/reset-password?email=${encodeURIComponent(email)}`;
  
  const response = await supabase.functions.invoke('send-email', {
    body: {
      type: 'reset-password',
      email,
      resetLink,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to send password reset email');
  }

  return response;
}
