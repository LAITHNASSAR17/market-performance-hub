
import { useAuth } from '@/contexts/AuthContext';

type SubscriptionFeature = 
  | 'unlimited_trades'
  | 'image_upload'
  | 'multi_image_upload'
  | 'analytics'
  | 'reports'
  | 'insights'
  | 'notes'
  | 'calendar_view'
  | 'export'
  | 'playbooks'
  | 'trade_rating'
  | 'emotion_tagging'
  | 'strategy_tagging';

export const useSubscriptionFeatures = () => {
  const { user } = useAuth();
  const tier = user?.subscription_tier || 'free';

  const features = {
    unlimited_trades: tier !== 'free',
    image_upload: tier !== 'free',
    multi_image_upload: tier === 'enterprise',
    analytics: tier !== 'free',
    reports: tier !== 'free',
    insights: tier !== 'free',
    notes: true,
    calendar_view: tier !== 'free',
    export: tier !== 'free',
    playbooks: tier === 'enterprise',
    trade_rating: tier === 'enterprise',
    emotion_tagging: tier === 'enterprise',
    strategy_tagging: tier === 'enterprise'
  };

  const canUseFeature = (feature: SubscriptionFeature) => {
    return features[feature];
  };

  const getTradeLimit = () => {
    if (tier === 'free') return 10;
    return Infinity;
  };

  const getImageLimit = () => {
    if (tier === 'enterprise') return 3;
    if (tier === 'premium') return 1;
    return 0;
  };

  return {
    canUseFeature,
    getTradeLimit,
    getImageLimit,
    currentTier: tier
  };
};
