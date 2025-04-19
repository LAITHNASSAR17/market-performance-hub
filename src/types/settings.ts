
// Extend this file as needed

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  subscription_tier?: string;
  country?: string;
}

export interface UserTableColumn {
  id: string;
  label: string;
  accessorKey: string;
  sortable?: boolean;
  className?: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  company_email: string;
  theme: string;
  language: string;
  logo_url?: string;
  favicon_url?: string;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan[];
  currency?: string;
  timezone?: string;
  maintenance_mode?: boolean;
  terms_url?: string;
  privacy_url?: string;
  support_url?: string;
  default_user_role?: string;
  allow_registrations?: boolean;
  custom_domain?: string;
  google_analytics_id?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  setup: string;
  rules: PlaybookRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  order: number;
  tradeType: 'long' | 'short' | 'both';
  tags: string[];
}

export interface PlaybookRule {
  id: string;
  description: string;
  type: 'entry' | 'exit' | 'management';
  order: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
