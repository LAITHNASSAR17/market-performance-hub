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
  support_phone?: string;
  copyright_text?: string;
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

export interface PlaybookRule {
  id: string;
  description: string;
  type: 'entry' | 'exit' | 'management' | 'risk' | 'custom';
  order: number;
}

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  setup: string;
  rules: PlaybookRule[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  order_number: number;
  is_private: boolean;
  trade_type: 'long' | 'short' | 'both';
  tags: string[];
  category?: string;
  rating?: number;
  r_multiple?: number;
  win_rate?: number;
  expected_value?: number;
  profit_factor?: number;
  net_profit_loss?: number;
  total_trades?: number;
  avg_winner?: number;
  avg_loser?: number;
  missed_trades?: number;
  
  // Remove backward compatibility fields as they're causing confusion
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

export interface HomepageContent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  features: string[];
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  trade_id?: string;
  tags?: string[];
}
