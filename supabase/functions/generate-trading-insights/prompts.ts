
import { TradeStats } from './types';

export const generateUserPrompt = (
  purpose: string,
  stats: TradeStats,
  tradesCount: number,
  timeRange: string = 'all',
  playbooks: any[] = []
) => {
  const baseStats = `
    Based on these trading statistics${timeRange !== 'all' ? ` from the ${timeRange} timeframe` : ''}:
    - Number of trades: ${tradesCount}
    - Win rate: ${stats.winRate}%
    - Average win: $${stats.avgWin}
    - Average loss: $${stats.avgLoss}
    - Profit factor: ${stats.profitFactor}
    - Largest win: $${stats.largestWin}
    - Largest loss: $${stats.largestLoss}
  `;

  if (purpose === 'advice') {
    return `
      ${baseStats}
      Generate a comprehensive trading analysis (300-400 words) that provides:
      - An assessment of overall trading performance
      - Specific strengths and weaknesses
      - Clear, actionable recommendations for improvement
      
      Return the response as a JSON object with an "analysis" field containing the text.
      Make it professional and insights-focused, aimed at helping traders improve their performance.
    `;
  }

  if (purpose === 'tips') {
    return `
      ${baseStats}
      Generate 3-5 specific trading tips focusing on:
      - Performance improvement opportunities
      - Risk management strategies
      - Trading psychology insights
      - Strategy optimization suggestions

      Return the response as a JSON object with an "insights" array, where each item has:
      - id: unique string
      - title: short, actionable tip title
      - content: detailed explanation with specific steps
      - category: one of ["performance", "risk", "psychology", "strategy"]
      - importance: one of ["high", "medium", "low"]

      Make tips specific and actionable, focused on practical improvements.
    `;
  }

  return `
    ${baseStats}
    ${tradesCount >= 10 ? `
    Analyze the trading patterns and provide 4-6 detailed insights focusing on:
    - Performance trends and specific patterns in the data
    - Risk management effectiveness and areas for improvement
    - Psychological aspects impacting trading decisions
    - Strategy strengths and potential optimization areas
    - Key metrics that need attention
    - Specific opportunities for performance enhancement
    ` : `
    Provide 3-4 initial insights about:
    - Current trading approach effectiveness
    - Risk management observations
    - Key areas requiring immediate focus
    - Specific next steps for improvement
    `}
    
    ${playbooks.length > 0 ? `Consider these existing trading playbooks: ${JSON.stringify(playbooks.map(p => p.title))}` : ''}

    Return the response as a JSON object with an "insights" array, where each item has:
    - id: unique string
    - title: clear, specific insight title
    - content: detailed explanation (50-100 words) with actionable recommendations
    - category: one of ["performance", "psychology", "risk", "strategy", "pattern", "data"]
    - importance: one of ["high", "medium", "low"]

    Make insights specific, data-driven, and focused on actionable improvements.
  `;
};
