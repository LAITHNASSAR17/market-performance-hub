
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const OpenPositionsCard: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          {t('analytics.openPositions') || 'OPEN POSITIONS'}
          <CircleIcon className="h-3 w-3 ml-2 text-blue-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-52">
        <p className="text-muted-foreground">{t('analytics.noOpenPositions') || 'There are no open positions.'}</p>
      </CardContent>
    </Card>
  );
};

export default OpenPositionsCard;
