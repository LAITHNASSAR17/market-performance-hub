
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RunningPLChart from '@/components/analytics/RunningPLChart';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChartTabProps {
  plData: { time: string; value: number }[];
}

const ChartTab: React.FC<ChartTabProps> = ({ plData }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <RunningPLChart data={plData} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.pairPerformance') || 'Pair Performance'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">EUR/USD</span>
                  <span className="text-sm font-medium text-green-500">+$850.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">GBP/USD</span>
                  <span className="text-sm font-medium text-green-500">+$320.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">USD/JPY</span>
                  <span className="text-sm font-medium text-red-500">-$150.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">AUD/USD</span>
                  <span className="text-sm font-medium text-red-500">-$420.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.timeOfDay') || 'Time of Day Performance'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">9:00 - 10:00</span>
                  <span className="text-sm font-medium text-green-500">+$920.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">10:00 - 11:00</span>
                  <span className="text-sm font-medium text-green-500">+$450.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">11:00 - 12:00</span>
                  <span className="text-sm font-medium text-red-500">-$180.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '18%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">12:00 - 13:00</span>
                  <span className="text-sm font-medium text-red-500">-$350.00</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartTab;
