
import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from '@/utils/encryption';
import { ProfileType, createProfileObject } from '@/types/database';

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

export const createUserProfile = async (userData: Partial<ProfileType>) => {
  // Create a properly structured object from the userData
  const profileData = { ...userData };
  
  // Ensure we're inserting an array for Supabase
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

export { supabase };
