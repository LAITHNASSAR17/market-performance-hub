
import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from '@/utils/encryption';
import { ProfileType, createProfileObject } from '@/types/database';

export const getAllProfiles = async (): Promise<ProfileType[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    
    return data as ProfileType[] || [];
  } catch (err) {
    console.error('Exception fetching profiles:', err);
    return [];
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching user profile:', err);
    return null;
  }
};

export const createUserProfile = async (userData: Partial<ProfileType>) => {
  try {
    if (!userData.id) {
      userData.id = self.crypto.randomUUID();
    }
    
    const profileData = createProfileObject(userData);
    
    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Exception creating user profile:', err);
    throw err;
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<ProfileType>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Exception updating user profile:', err);
    throw err;
  }
};

export { supabase };
