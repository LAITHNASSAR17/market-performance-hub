import { createClient } from '@supabase/supabase-js';
import { supabase as typedSupabase } from '@/integrations/supabase/client';

// This is a deprecated client, please use the typed client from '@/integrations/supabase/client'
// We're keeping this for backward compatibility but will phase it out
const supabaseUrl = "https://gworvqqjzirypwfffapt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3b3J2cXFqemlyeXB3ZmZmYXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTMwMTEsImV4cCI6MjA2MDA2OTAxMX0.djQ7IteaNoWH8Eeo9hTCwbdaB6jPVkdBfxqrCGr2KdI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get site settings using the typed client
export const getSiteSettings = async () => {
  const { data, error } = await typedSupabase
    .from('site_settings')
    .select('*')
    .single();
    
  if (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
  
  return data;
};

// Function to update site settings using the typed client
export const updateSiteSettings = async (settings: any) => {
  const { data, error } = await typedSupabase
    .from('site_settings')
    .upsert(settings)
    .select();
    
  if (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
  
  return data;
};

// SQL definitions for our tables
// This is just for reference, you'll need to create these tables in the Supabase dashboard

/*
-- Keep existing code (SQL definitions for tables)
*/
