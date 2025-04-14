
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface TradingTipsProps {
  className?: string;
}

const TradingTips: React.FC<TradingTipsProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  
  // Trading tips based on language
  const tips = language === 'ar' ? [
    'قم بتوثيق كل صفقة لتحسين أدائك',
    'تتبع نتائج استراتيجياتك المختلفة',
    'حدد نقاط القوة والضعف في تداولك',
    'تعلم من أخطائك وحسن استراتيجيتك',
  ] : [
    'Document every trade to improve your performance',
    'Track results of different strategies',
    'Identify strengths and weaknesses in your trading',
    'Learn from mistakes and refine your strategy',
  ];
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{language === 'ar' ? 'نصائح تداول' : 'Trading Tips'}</CardTitle>
        <CardDescription>
          {language === 'ar' ? 'نصائح لمساعدتك على تحسين أدائك في التداول' : 'Tips to help you improve your trading performance'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TradingTips;
