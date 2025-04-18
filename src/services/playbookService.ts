
import { supabase } from "@/lib/supabase";
import { PlaybookEntry } from "@/hooks/usePlaybooks";

export const togglePlaybookPublic = async (
  playbookId: string,
  isPublic: boolean
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // If making public, generate a token; if making private, remove the token
    const publicToken = isPublic ? generatePublicToken() : null;

    const { data, error } = await supabase
      .from("playbooks")
      .update({ 
        is_public: isPublic,
        public_token: publicToken 
      })
      .eq("id", playbookId)
      .select("public_token")
      .single();

    if (error) throw error;
    
    return { 
      success: true, 
      token: data?.public_token || undefined 
    };
  } catch (error) {
    console.error("Error toggling playbook public status:", error);
    return { 
      success: false, 
      error: "Failed to update playbook visibility" 
    };
  }
};

export const getPublicPlaybook = async (token: string): Promise<PlaybookEntry | null> => {
  try {
    const { data, error } = await supabase
      .from("playbooks")
      .select("*")
      .eq("public_token", token)
      .eq("is_public", true)
      .single();

    if (error) throw error;
    return data as PlaybookEntry;
  } catch (error) {
    console.error("Error fetching public playbook:", error);
    return null;
  }
};

// Helper function to generate a random token
const generatePublicToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
