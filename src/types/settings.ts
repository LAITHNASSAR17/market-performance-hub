
export interface SiteSettings {
  id: string;
  site_name: string;
  theme?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface HomepageContent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  created_at: string;
  updated_at: string;
}
