
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const minimumTradesRequired = {
  insights: 5,
  advice: 3,
  tips: 3
};

export const modelConfig = {
  model: "meta-llama/llama-4-sonar-small-128k-online",
  temperature: 0.2,
  max_tokens: 2000
};

export const systemPrompt = 'You are an expert trading advisor specializing in technical analysis, risk management, and trading psychology. Provide detailed, actionable insights based on trading data. Focus on specific, implementable recommendations.';
