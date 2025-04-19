
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = "https://hqmpfnjiunjqwyppscad.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxbXBmbmppdW5qcXd5cHBzY2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMDI1MzksImV4cCI6MjA2MDY3ODUzOX0.C9HNymy6S9cp1Fd36SdKRufN_RduTuCt2f95dGGowgg";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
    .upsert(settings)
    .select();
    
  if (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
  
  return data;
};
