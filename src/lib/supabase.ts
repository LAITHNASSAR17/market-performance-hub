
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
  
  return data;
};

// Update other functions similarly to support new fields
export const createUserProfile = async (userData: Partial<ProfileType>) => {
  // Create a typed object with all possible fields for Supabase
  const profileData: Partial<ProfileType> = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    is_admin: userData.is_admin,
    is_blocked: userData.is_blocked,
    subscription_tier: userData.subscription_tier,
    email_verified: userData.email_verified,
    country: userData.country,
    avatar_url: userData.avatar_url,
    created_at: userData.created_at,
    updated_at: userData.updated_at
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, userData: Partial<ProfileType>) => {
  // Create a properly typed object for Supabase
  const updateData: Partial<ProfileType> = {};
  
  // Only include fields that are provided
  if (userData.name !== undefined) updateData.name = userData.name;
  if (userData.email !== undefined) updateData.email = userData.email;
  if (userData.password !== undefined) updateData.password = userData.password;
  if (userData.role !== undefined) updateData.role = userData.role;
  if (userData.is_admin !== undefined) updateData.is_admin = userData.is_admin;
  if (userData.is_blocked !== undefined) updateData.is_blocked = userData.is_blocked;
  if (userData.subscription_tier !== undefined) updateData.subscription_tier = userData.subscription_tier;
  if (userData.email_verified !== undefined) updateData.email_verified = userData.email_verified;
  if (userData.country !== undefined) updateData.country = userData.country;
  if (userData.avatar_url !== undefined) updateData.avatar_url = userData.avatar_url;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
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
