
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
*/
