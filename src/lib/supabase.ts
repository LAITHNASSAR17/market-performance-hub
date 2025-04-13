
import { createClient } from '@supabase/supabase-js';

// Using the values directly to avoid environment variable issues
const supabaseUrl = "https://gworvqqjzirypwfffapt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3b3J2cXFqemlyeXB3ZmZmYXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTMwMTEsImV4cCI6MjA2MDA2OTAxMX0.djQ7IteaNoWH8Eeo9hTCwbdaB6jPVkdBfxqrCGr2KdI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get site settings
export const getSiteSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();
    
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
    .update(settings)
    .eq('site_name', settings.site_name)
    .select();
    
  if (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
  
  return data;
};

// Function to upload a file to storage
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true
  });
  
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  
  // Get the public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
};

// Function to update user profile
export const updateUserProfile = async (
  userId: string,
  userData: {
    avatar_url?: string;
    full_name?: string;
    username?: string;
    email?: string;
    country?: string;
  }
) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ 
      id: userId,
      ...userData,
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return true;
};

// Function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned' error
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data || null;
};

// SQL definitions for our tables
// This is just for reference, you'll need to create these tables in the Supabase dashboard

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

-- User Profiles Table
create table public.profiles (
  id uuid primary key references auth.users,
  full_name text,
  username text,
  avatar_url text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
