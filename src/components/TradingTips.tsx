
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Array of trading tips
const tips = [
  "Always use stop losses to manage risk and protect your capital.",
  "Keep a trading journal to track your progress and learn from mistakes.",
  "Define your risk tolerance before entering a trade.",
  "Focus on risk management over chasing high returns.",
  "Don't overtrade – quality over quantity matters in trading.",
  "Develop a consistent trading strategy and stick to it.",
  "Avoid emotional trading decisions during market volatility.",
  "Review your trades regularly to identify patterns and improve.",
  "Stay informed about market news that could impact your trades.",
  "Always have a clear exit strategy before entering a position.",
  "Trade with the trend rather than against it.",
  "Focus on a few markets rather than trying to trade everything.",
  "Remember that preserving capital is more important than making profits.",
  "Take breaks to avoid mental fatigue and maintain focus.",
  "Use multiple timeframes to confirm your trading decisions."
];

const TradingTips: React.FC = () => {
  // Randomly select 3 tips to display
  const randomTips = React.useMemo(() => {
    const shuffled = [...tips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div className="space-y-3">
      {randomTips.map((tip, index) => (
        <Card key={index} className="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-amber-500">
          <CardContent className="p-3 flex">
            <Lightbulb className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{tip}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TradingTips;
