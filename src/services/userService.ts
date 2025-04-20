
import { supabase } from '@/lib/supabase';
import { User } from '@/types/settings';

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) return null;
      
      const userId = session.user.id;
      
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError || !profileData) return null;
      
      return {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        is_admin: profileData.is_admin,
        isAdmin: profileData.is_admin,
        is_blocked: profileData.is_blocked,
        isBlocked: profileData.is_blocked,
        subscription_tier: profileData.subscription_tier,
        country: profileData.country
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error || !data) return [];
      
      return data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        is_admin: profile.is_admin,
        isAdmin: profile.is_admin,
        is_blocked: profile.is_blocked,
        isBlocked: profile.is_blocked,
        subscription_tier: profile.subscription_tier,
        country: profile.country
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
};
