
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

// Helper function to safely update homepage content
export const updateHomepageContent = async (contentData: any) => {
  try {
    // Ensure features is in the correct format for JSONB
    if (contentData.features && Array.isArray(contentData.features)) {
      // Cast the features array to Json type
      contentData.features = contentData.features as unknown as Json;
    }
    
    const { data, error } = await supabase
      .from('homepage_content')
      .upsert(contentData)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating homepage content:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Exception updating homepage content:', err);
    throw err;
  }
};

// Helper function to safely update site settings
export const updateSiteSettings = async (settingsData: any) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .update(settingsData)
      .eq('site_name', settingsData.site_name || 'TradeTracker')
      .select()
      .single();
      
    if (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Exception updating site settings:', err);
    throw err;
  }
};

export { supabase };
