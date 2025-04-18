
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/contexts/LanguageContext';
import { ChartLine, Target, BookMarked, LineChart, Lightbulb, Hash } from 'lucide-react';

// Import custom hooks
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { usePlData } from '@/hooks/usePlData';
import { useTagsState } from '@/hooks/useTagsState';
import { usePlaybooks } from '@/hooks/usePlaybooks';

// Import tab components
import OverviewTab from '@/components/analytics/OverviewTab';
import TagsTab from '@/components/analytics/TagsTab';
import PlaybookTab from '@/components/analytics/PlaybookTab';
import ChartTab from '@/components/analytics/ChartTab';
import TradingTips from '@/components/TradingTips';
import HashtagsTab from '@/components/analytics/HashtagsTab';

const Analytics: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Use our custom hooks to manage state
  const stats = useAnalyticsStats();
  const plData = usePlData();
  const { mistakes, setMistakes, setups, setSetups, habits, setHabits, tradingDays } = useTagsState();
  const { playbooks, addPlaybook, updatePlaybook, deletePlaybook } = usePlaybooks();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-300">
              {t('analytics.subtitle')}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap md:w-fit w-full mb-6 gap-1">
            <TabsTrigger value="overview" className="flex-1 md:flex-none">
              <ChartLine className="h-4 w-4 mr-2" />
              {t('overview') || 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex-1 md:flex-none">
              <Target className="h-4 w-4 mr-2" />
              {t('tags') || 'Tags'}
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex-1 md:flex-none">
              <Hash className="h-4 w-4 mr-2" />
              {t('hashtags') || 'Hashtags'}
            </TabsTrigger>
            <TabsTrigger value="playbook" className="flex-1 md:flex-none">
              <BookMarked className="h-4 w-4 mr-2" />
              {t('playbook') || 'Playbook'}
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex-1 md:flex-none">
              <LineChart className="h-4 w-4 mr-2" />
              {t('chart') || 'Chart'}
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex-1 md:flex-none">
              <Lightbulb className="h-4 w-4 mr-2" />
              {t('tips') || 'Tips'}
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <OverviewTab />
          </TabsContent>
          
          {/* Tags Tab */}
          <TabsContent value="tags" className="mt-0">
            <TagsTab 
              mistakes={mistakes}
              setMistakes={setMistakes}
              setups={setups}
              setSetups={setSetups}
              habits={habits}
              setHabits={setHabits}
            />
          </TabsContent>
          
          {/* Hashtags Analytics Tab */}
          <TabsContent value="hashtags" className="mt-0">
            <HashtagsTab />
          </TabsContent>
          
          {/* Playbook Tab */}
          <TabsContent value="playbook" className="mt-0">
            <PlaybookTab />
          </TabsContent>
          
          {/* Chart Tab */}
          <TabsContent value="chart" className="mt-0">
            <ChartTab plData={plData} />
          </TabsContent>
          
          {/* Tips Tab */}
          <TabsContent value="tips" className="mt-0">
            <TradingTips />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
