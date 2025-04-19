
import { supabase } from '@/lib/supabase';

export type SubscriptionFeature = 
  | 'max_trades'
  | 'trading_accounts'
  | 'ai_analysis'
  | 'reports'
  | 'image_upload'
  | 'notebook'
  | 'trade_list';

export async function checkFeatureAccess(feature: SubscriptionFeature): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc('has_feature_access', {
    user_id: user.id,
    feature: feature
  });

  if (error) {
    console.error('Error checking feature access:', error);
    return false;
  }

  return data || false;
}

export async function getFeatureLimits(): Promise<{
  maxTrades: number;
  tradingAccounts: number;
  aiAnalysisPerDay: number;
  reportsEnabled: boolean;
  imageUploadEnabled: boolean;
  advancedNotebook: boolean;
  tradeListBasic: boolean;
} | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('features')
    .single();

  if (error || !data) {
    console.error('Error fetching feature limits:', error);
    return null;
  }

  return {
    maxTrades: data.features.max_trades || 0,
    tradingAccounts: data.features.trading_accounts || 0,
    aiAnalysisPerDay: data.features.ai_analysis_per_day || 0,
    reportsEnabled: data.features.reports_enabled || false,
    imageUploadEnabled: data.features.image_upload_enabled || false,
    advancedNotebook: data.features.advanced_notebook || false,
    tradeListBasic: data.features.trade_list_basic || false
  };
}
