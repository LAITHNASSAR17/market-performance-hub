
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/contexts/LanguageContext';
import { ChartLine, ChartBarIcon, Target, BookMarked } from 'lucide-react';

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

const Analytics: React.FC = () => {
  const { t } = useLanguage();
  
  // Use our custom hooks to manage state
  const stats = useAnalyticsStats();
  const plData = usePlData();
  const { mistakes, setMistakes, setups, setSetups, habits, setHabits } = useTagsState();
  const playbooks = usePlaybooks();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title') || 'Analytics'}</h1>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 md:w-[400px] mb-4">
            <TabsTrigger value="overview">
              <ChartLine className="h-4 w-4 mr-2" />
              {t('analytics.overview') || 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Target className="h-4 w-4 mr-2" />
              {t('analytics.tags') || 'Tags'}
            </TabsTrigger>
            <TabsTrigger value="playbook">
              <BookMarked className="h-4 w-4 mr-2" />
              {t('analytics.playbook') || 'Playbook'}
            </TabsTrigger>
            <TabsTrigger value="chart">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              {t('analytics.chart') || 'Chart'}
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab stats={stats} />
          </TabsContent>
          
          {/* Tags Tab */}
          <TabsContent value="tags">
            <TagsTab 
              mistakes={mistakes}
              setMistakes={setMistakes}
              setups={setups}
              setSetups={setSetups}
              habits={habits}
              setHabits={setHabits}
            />
          </TabsContent>
          
          {/* Playbook Tab */}
          <TabsContent value="playbook">
            <PlaybookTab playbooks={playbooks} />
          </TabsContent>
          
          {/* Chart Tab */}
          <TabsContent value="chart">
            <ChartTab plData={plData} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
