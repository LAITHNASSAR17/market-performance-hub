
import { TradingInsight } from './types.ts';

export const getFallbackInsights = (minTrades: number): TradingInsight[] => [
  {
    id: 'data-1',
    title: 'More Data Needed',
    content: `Add more trades to get accurate analysis. We need at least ${minTrades} trades.`,
    category: 'data',
    importance: 'high'
  }
];

export const getErrorFallbackInsights = (): TradingInsight[] => [
  {
    id: 'error-1',
    title: 'Analysis Temporarily Unavailable',
    content: 'Unable to generate insights at this time. Please try again later.',
    category: 'error',
    importance: 'high'
  }
];

export const getDefaultFallbackInsights = (): TradingInsight[] => [
  {
    id: 'fallback-1',
    title: 'Focus on Profit Optimization',
    content: 'Review your trading strategy to identify patterns in profitable trades and replicate successful conditions.',
    category: 'performance',
    importance: 'high'
  },
  {
    id: 'fallback-2',
    title: 'Session Analysis',
    content: 'Analyze your most successful trading sessions and avoid times with recurring losses.',
    category: 'strategy',
    importance: 'medium'
  },
  {
    id: 'fallback-3',
    title: 'Risk Management Review',
    content: 'Ensure clear entry and exit points are defined before entering trades to improve risk management.',
    category: 'risk',
    importance: 'high'
  },
  {
    id: 'fallback-4',
    title: 'Psychological Discipline',
    content: 'Maintain consistent trading psychology and avoid emotional decision-making during market volatility.',
    category: 'psychology',
    importance: 'medium'
  }
];
