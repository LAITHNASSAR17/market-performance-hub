import { createClient } from '@supabase/supabase-js';
import { supabase as typedSupabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// This is a deprecated client, please use the typed client from '@/integrations/supabase/client'
// We're keeping this for backward compatibility but will phase it out
const supabaseUrl = "https://gworvqqjzirypwfffapt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3b3J2cXFqemlyeXB3ZmZmYXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTMwMTEsImV4cCI6MjA2MDA2OTAxMX0.djQ7IteaNoWH8Eeo9hTCwbdaB6jPVkdBfxqrCGr2KdI";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Function to get site settings using the typed client
export const getSiteSettings = async () => {
  const { data, error } = await typedSupabase
    .from('site_settings')
    .select('*')
    .maybeSingle(); // Use maybeSingle to handle cases where no record exists
    
  if (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
  
  return data;
};

// Function to update site settings using the typed client
export const updateSiteSettings = async (settings: Database['public']['Tables']['site_settings']['Insert']) => {
  const { data, error } = await typedSupabase
    .from('site_settings')
    .upsert(settings)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
  
  return data;
};

// SQL definitions for our tables
// This is just for reference, you'll need to create these tables in the Supabase dashboard

/*
-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  site_name TEXT NULL,
  company_email TEXT NULL,
  support_phone TEXT NULL,
  copyright_text TEXT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows only authenticated users to view site settings
CREATE POLICY "Allow authenticated users to view site settings" ON site_settings FOR
SELECT
  TO PUBLIC USING (auth.role () = 'authenticated');

-- Create a policy that allows only authenticated users to insert site settings
CREATE POLICY "Allow authenticated users to insert site settings" ON site_settings FOR
INSERT
  TO public WITH CHECK (auth.role () = 'authenticated');

-- Create a policy that allows only authenticated users to update site settings
CREATE POLICY "Allow authenticated users to update site settings" ON site_settings FOR
UPDATE
  TO public USING (auth.role () = 'authenticated');
*/
