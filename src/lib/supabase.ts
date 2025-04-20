

import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from '@/utils/encryption';
import { ProfileType, createProfileObject } from '@/types/database';

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
  const profileData = createProfileObject(userData);
  
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
  const updateData = createProfileObject(userData);
  
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
