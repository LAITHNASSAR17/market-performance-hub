
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, BarChart, Clock, Percent as PercentIcon, LineChart, Target, Lightbulb } from 'lucide-react';
import StatCard from '@/components/StatCard';
import HashtagBadge from '@/components/HashtagBadge';
import { cn } from '@/lib/utils';
import TradingTips from '@/components/TradingTips';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { useLanguage } from '@/contexts/LanguageContext';

interface InsightsProps {
  // Define any props here
}

const Insights: React.FC<InsightsProps> = ({ /* props */ }) => {
  const { trades, allHashtags, addHashtag } = useTrade();
  const { language } = useLanguage();
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const stats = useAnalyticsStats();

  // Filter trades based on selected hashtags
  const filteredTrades = trades.filter(trade =>
    selectedHashtags.every(tag => trade.hashtags.includes(tag))
  );

  // Calculate total profit/loss for filtered trades
  const totalProfitLoss = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);

  // Calculate win rate for filtered trades
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Handler for selecting/deselecting a hashtag
  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Handler for adding a new hashtag
  const handleAddHashtag = () => {
    if (newHashtag.trim() !== '') {
      addHashtag(newHashtag.trim());
      setSelectedHashtags(prev => [...prev, newHashtag.trim()]);
      setNewHashtag('');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4">{language === 'ar' ? 'رؤى التداول' : 'Trading Insights'}</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={language === 'ar' ? 'إجمالي الربح/الخسارة' : 'Total Profit/Loss'}
            value={`$${totalProfitLoss.toFixed(2)}`}
            trend={totalProfitLoss > 0 ? 'up' : totalProfitLoss < 0 ? 'down' : 'neutral'}
            icon={<DollarSign className="h-5 w-5" />}
            color={totalProfitLoss > 0 ? 'green' : totalProfitLoss < 0 ? 'red' : 'default'}
            description={`${language === 'ar' ? 'إجمالي الصفقات: ' : 'Trades in total: '}${totalTrades}`}
          />
          <StatCard
            title={language === 'ar' ? 'معدل الربح' : 'Win Rate'}
            value={`${winRate.toFixed(1)}%`}
            description={`${winningTrades}/${totalTrades} ${language === 'ar' ? 'صفقات' : 'trades'}`}
            icon={<PercentIcon className="h-5 w-5" />}
          />
          <StatCard
            title={language === 'ar' ? 'إجمالي الصفقات' : 'Total Trades'}
            value={totalTrades}
            icon={<BarChart className="h-5 w-5" />}
          />
          <StatCard
            title={language === 'ar' ? 'متوسط المدة' : 'Average Duration'}
            value="N/A"
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* Hashtag Filters */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{language === 'ar' ? 'تصفية حسب الهاشتاغ' : 'Filter by Hashtags'}</h2>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleHashtag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  selectedHashtags.includes(tag)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                #{tag}
              </button>
            ))}
            <div className="flex items-center">
              <input
                type="text"
                placeholder={language === 'ar' ? 'إضافة هاشتاغ جديد' : 'Add new hashtag'}
                value={newHashtag}
                onChange={e => setNewHashtag(e.target.value)}
                className="border rounded-l px-2 py-1 text-sm"
              />
              <button
                onClick={handleAddHashtag}
                className="bg-green-500 text-white rounded-r px-3 py-1 text-sm hover:bg-green-600"
              >
                {language === 'ar' ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Trading Tips */}
        <div className="mb-6">
          <TradingTips />
        </div>

        {/* Detailed Trade Analysis */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">{language === 'ar' ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="performance">{language === 'ar' ? 'الأداء' : 'Performance'}</TabsTrigger>
            <TabsTrigger value="trades">{language === 'ar' ? 'الصفقات' : 'Trades'}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{language === 'ar' ? 'نظرة عامة' : 'Overview'}</h3>
              <p>
                {language === 'ar' 
                  ? 'عرض ملخص للمقاييس والرؤى الرئيسية بناءً على الصفقات المصفاة.'
                  : 'Display a summary of key metrics and insights based on the filtered trades.'}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{language === 'ar' ? 'تحليل الأداء' : 'Performance Analysis'}</h3>
              <p>
                {language === 'ar' 
                  ? 'تصور مقاييس الأداء بمرور الوقت، مثل الربح/الخسارة، ومعدل الفوز، ومتوسط مدة التداول.'
                  : 'Visualize performance metrics over time, such as profit/loss, win rate, and average trade duration.'}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="trades" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{language === 'ar' ? 'قائمة الصفقات' : 'Trade List'}</h3>
              <p>
                {language === 'ar' 
                  ? 'قائمة بجميع الصفقات التي تتطابق مع الهاشتاغات المحددة، مع تفاصيل مثل التاريخ والزوج والربح/الخسارة والمدة.'
                  : 'List all trades that match the selected hashtags, with details such as date, pair, profit/loss, and duration.'}
              </p>
              <ul className="list-disc pl-5">
                {filteredTrades.map(trade => (
                  <li key={trade.id}>
                    {trade.date} - {trade.pair} - ${trade.profitLoss.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
