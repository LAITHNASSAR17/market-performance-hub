
import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from '@/utils/encryption';
import { User } from '@/types/auth';
import { Database } from '@/integrations/supabase/types';

type UserRow = Database['public']['Tables']['users']['Row'];

export const getUserByEmail = async (email: string): Promise<User | null> => {
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
    
    if (!data) return null;

    return mapUserRowToUser(data);
  } catch (err) {
    console.error('Exception fetching user profile:', err);
    return null;
  }
};

export const createUserProfile = async (userData: Partial<User>): Promise<User | null> => {
  try {
    if (!userData.id) {
      userData.id = self.crypto.randomUUID();
    }
    
    const userRow = mapUserToUserRow(userData);
    
    const { data, error } = await supabase
      .from('users')
      .insert(userRow)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    return data ? mapUserRowToUser(data) : null;
  } catch (err) {
    console.error('Exception creating user profile:', err);
    throw err;
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const userRow = mapUserToUserRow(userData);
    
    const { data, error } = await supabase
      .from('users')
      .update(userRow)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data ? mapUserRowToUser(data) : null;
  } catch (err) {
    console.error('Exception updating user profile:', err);
    throw err;
  }
};

// Helper functions to map between User type and Database Row type
const mapUserRowToUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name || '',
  email: row.email || '',
  role: row.role,
  is_admin: row.is_admin,
  is_blocked: row.is_blocked,
  subscription_tier: row.subscription_tier,
  email_verified: row.email_verified,
  avatar_url: row.avatar_url,
  country: row.country
});

const mapUserToUserRow = (user: Partial<User>): Partial<UserRow> => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password: user.password,
  role: user.role,
  is_admin: user.is_admin,
  is_blocked: user.is_blocked,
  subscription_tier: user.subscription_tier,
  email_verified: user.email_verified,
  avatar_url: user.avatar_url,
  country: user.country
});

export const getAllProfiles = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    
    return data && Array.isArray(data) ? data.map(mapUserRowToUser) : [];
  } catch (err) {
    console.error('Exception fetching profiles:', err);
    return [];
  }
};

export const updateHomepageContent = async (contentData: any) => {
  try {
    // Handle features data for JSONB column
    if (contentData.features) {
      // Make sure it's in the correct format for JSONB
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

export const getHomepageContent = async () => {
  try {
    const { data, error } = await supabase
      .from('homepage_content')
      .select('*')
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching homepage content:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching homepage content:', err);
    return null;
  }
};

export const getSiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching site settings:', err);
    return null;
  }
};

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
