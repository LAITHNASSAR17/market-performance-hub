
export interface TradingInsight {
  id: string;
  title: string;
  content: string;
  category: 'performance' | 'psychology' | 'risk' | 'strategy' | 'pattern' | 'data' | 'error';
  importance: 'high' | 'medium' | 'low';
}

export interface TradeStats {
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
}

export interface GenerateInsightsRequest {
  trades: any[];
  stats: TradeStats;
  playbooks?: any[];
  timeRange?: string;
  purpose?: 'insights' | 'advice' | 'tips';
}

export interface LlamaAPIResponse {
  choices: Array<{
    message: {
      content: string;
    }
  }>;
  error?: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}
