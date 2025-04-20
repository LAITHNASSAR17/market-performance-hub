import { supabase, getUserByEmail, createUserProfile, getAllProfiles, updateUserProfile } from '@/lib/supabase';
import { hashPassword, comparePassword } from '@/utils/encryption';
import { User } from '@/types/auth';
import { ProfileType, createProfileObject } from '@/types/database';

export async function loginUser(email: string, password: string): Promise<ProfileType> {
  const userData = await getUserByEmail(email);
  
  if (!userData) {
    throw new Error('Invalid credentials');
  }
  
  if (userData.password && comparePassword(password, userData.password)) {
    if (userData.is_blocked) {
      throw new Error('User is blocked');
    }
    return userData;
  }
  
  throw new Error('Invalid credentials');
}

export async function registerUser(name: string, email: string, password: string, country?: string): Promise<void> {
  const hashedPassword = hashPassword(password);
  
  const profileData = createProfileObject({
    name,
    email,
    password: hashedPassword,
    role: 'user',
    is_admin: false,
    is_blocked: false,
    subscription_tier: 'free',
    email_verified: false,
    country
  });
  
  await createUserProfile(profileData);
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
