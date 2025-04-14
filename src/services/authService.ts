
import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';
import { hashPassword, comparePassword } from '@/utils/encryption';

export const authService = {
  async register(name: string, email: string, password: string) {
    const hashedPassword = hashPassword(password);
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        is_blocked: false,
        subscription_tier: 'free'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) throw new Error('Invalid credentials');
    if (!comparePassword(password, data.password)) throw new Error('Invalid credentials');
    if (data.is_blocked) throw new Error('User is blocked');

    return data;
  },

  async updateUser(userId: string, updates: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data;
  },

  async updateSubscriptionTier(userId: string, tier: string) {
    const { error } = await supabase
      .from('users')
      .update({ subscription_tier: tier })
      .eq('id', userId);

    if (error) throw error;
  }
};
