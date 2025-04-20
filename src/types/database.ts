
export interface ProfileType {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  is_admin?: boolean;
  is_blocked?: boolean;
  subscription_tier?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
  password?: string;
  email_verified?: boolean;
}

export function createProfileObject(data: Partial<ProfileType>): Partial<ProfileType> {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar_url: data.avatar_url,
    role: data.role,
    is_admin: data.is_admin,
    is_blocked: data.is_blocked,
    subscription_tier: data.subscription_tier,
    country: data.country,
    password: data.password,
    email_verified: data.email_verified,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
