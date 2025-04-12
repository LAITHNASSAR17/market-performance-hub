
import { supabase } from '@/lib/supabase';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  async getUserById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return formatUser(data);
  },

  async getAllUsers(): Promise<IUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !data) return [];
    return data.map(formatUser);
  },

  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error || !data) throw new Error(`Error creating user: ${error?.message}`);
    return formatUser(data);
  },

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return null;
    return formatUser(data);
  },

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async findUsersByFilter(filter: Partial<IUser>): Promise<IUser[]> {
    let query = supabase.from('users').select('*');
    
    // Apply filters dynamically
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error || !data) return [];
    return data.map(formatUser);
  }
};

// Helper function to format Supabase data to our interface format
function formatUser(data: any): IUser {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
    isBlocked: data.is_blocked || false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
