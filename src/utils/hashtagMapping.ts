
import { supabase } from '@/lib/supabase';

export interface HashtagMapping {
  hashtag: string;
  page_route: string;
}

// Get all hashtag mappings from the database
export const getHashtagMappings = async (): Promise<HashtagMapping[]> => {
  try {
    const { data, error } = await supabase
      .from('hashtag_mappings')
      .select('hashtag, page_route');
      
    if (error) {
      console.error('Error fetching hashtag mappings:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching hashtag mappings:', error);
    return [];
  }
};

// Get the route for a specific hashtag
export const getRouteForHashtag = async (hashtag: string): Promise<string | null> => {
  try {
    // Remove # if present
    const tag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    
    const { data, error } = await supabase
      .from('hashtag_mappings')
      .select('page_route')
      .eq('hashtag', tag)
      .single();
      
    if (error) {
      console.error('Error fetching hashtag mapping:', error);
      return null;
    }
    
    return data?.page_route || null;
  } catch (error) {
    console.error('Error fetching hashtag mapping:', error);
    return null;
  }
};

// Add a new hashtag mapping
export const addHashtagMapping = async (hashtag: string, pageRoute: string): Promise<boolean> => {
  try {
    // Remove # if present
    const tag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    
    const { error } = await supabase
      .from('hashtag_mappings')
      .insert({ hashtag: tag, page_route: pageRoute });
      
    if (error) {
      console.error('Error adding hashtag mapping:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding hashtag mapping:', error);
    return false;
  }
};

// Update an existing hashtag mapping
export const updateHashtagMapping = async (oldHashtag: string, newHashtag: string, pageRoute: string): Promise<boolean> => {
  try {
    // Remove # if present
    const oldTag = oldHashtag.startsWith('#') ? oldHashtag.substring(1) : oldHashtag;
    const newTag = newHashtag.startsWith('#') ? newHashtag.substring(1) : newHashtag;
    
    const { error } = await supabase
      .from('hashtag_mappings')
      .update({ hashtag: newTag, page_route: pageRoute })
      .eq('hashtag', oldTag);
      
    if (error) {
      console.error('Error updating hashtag mapping:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating hashtag mapping:', error);
    return false;
  }
};

// Delete a hashtag mapping
export const deleteHashtagMapping = async (hashtag: string): Promise<boolean> => {
  try {
    // Remove # if present
    const tag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    
    const { error } = await supabase
      .from('hashtag_mappings')
      .delete()
      .eq('hashtag', tag);
      
    if (error) {
      console.error('Error deleting hashtag mapping:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting hashtag mapping:', error);
    return false;
  }
};

// Navigate to the page for a specific hashtag
export const navigateToHashtagPage = async (hashtag: string, navigate: (route: string) => void): Promise<boolean> => {
  try {
    const route = await getRouteForHashtag(hashtag);
    
    if (route) {
      navigate(route);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error navigating to hashtag page:', error);
    return false;
  }
};
