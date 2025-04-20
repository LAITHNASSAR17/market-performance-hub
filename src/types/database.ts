
// Database types for improved type safety across the application

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

export interface HomeContent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  features?: any;
  created_at: string;
  updated_at: string;
}

// Helper function to convert database format to application format
export const mapHomeContentFromDB = (data: any): HomeContent => {
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle || null,
    description: data.description || null,
    primaryButtonText: data.primary_button_text || null,
    primaryButtonUrl: data.primary_button_url || null,
    secondaryButtonText: data.secondary_button_text || null,
    secondaryButtonUrl: data.secondary_button_url || null,
    features: data.features || [],
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Helper function for profile operations
export const createProfileObject = (data: Partial<ProfileType>): Partial<ProfileType> => {
  const profile: Partial<ProfileType> = {};
  
  if (data.id !== undefined) profile.id = data.id;
  if (data.name !== undefined) profile.name = data.name;
  if (data.email !== undefined) profile.email = data.email;
  if (data.password !== undefined) profile.password = data.password;
  if (data.role !== undefined) profile.role = data.role;
  if (data.is_admin !== undefined) profile.is_admin = data.is_admin;
  if (data.is_blocked !== undefined) profile.is_blocked = data.is_blocked;
  if (data.subscription_tier !== undefined) profile.subscription_tier = data.subscription_tier;
  if (data.email_verified !== undefined) profile.email_verified = data.email_verified;
  if (data.country !== undefined) profile.country = data.country;
  if (data.avatar_url !== undefined) profile.avatar_url = data.avatar_url;
  if (data.created_at !== undefined) profile.created_at = data.created_at;
  if (data.updated_at !== undefined) profile.updated_at = data.updated_at;
  
  return profile;
};
