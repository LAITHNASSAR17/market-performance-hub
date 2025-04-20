
import { supabase } from '@/integrations/supabase/client';

// Re-export the client for backward compatibility
export { supabase };

// Type definition for profiles
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

// Function to get site settings
export const getSiteSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
  
  return data;
};

// Function to update site settings
export const updateSiteSettings = async (settings: any) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert(settings)
    .select();
    
  if (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
  
  return data;
};

// Function to get user profile by email
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

// Function to create a new user profile
export const createUserProfile = async (userData: any) => {
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

// Function to update user profile
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

// Function to get all profiles
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
  
  return data;
};

// SQL definitions for our tables are kept for reference

/*
-- Users Table
create table public.users (
  id uuid not null default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'user',
  is_blocked boolean not null default false,
  subscription_tier text default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- Notes Table
create table public.notes (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- Trades Table
create table public.trades (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  symbol text not null,
  entry_price numeric not null,
  exit_price numeric,
  quantity numeric not null,
  direction text not null check (direction in ('long', 'short')),
  entry_date timestamptz not null,
  exit_date timestamptz,
  profit_loss numeric,
  fees numeric default 0,
  notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- Site Settings Table
create table public.site_settings (
  site_name text primary key,
  company_email text not null,
  support_phone text,
  copyright_text text,
  updated_at timestamptz not null default now()
);
*/
