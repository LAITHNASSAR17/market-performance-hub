
import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from '@/utils/encryption';

// Update ProfileType to include new fields
export interface ProfileType {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
  is_blocked?: boolean;
  is_admin?: boolean;
  role?: string;
  subscription_tier?: string;
  password?: string;
  email_verified?: boolean;
}

// Export the function to get all profiles
export const getAllProfiles = async (): Promise<ProfileType[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  
  return data as ProfileType[];
};

// Update existing functions to use the new ProfileType
export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data ? {
    ...data,
    password: data.password || undefined,
    email_verified: data.email_verified || false
  } : null;
};

// Update other functions similarly to support new fields
export const createUserProfile = async (userData: Partial<ProfileType>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(userData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, userData: Partial<ProfileType>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
};

// Export the Supabase client
export { supabase };
