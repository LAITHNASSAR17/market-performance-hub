
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SiteSettings from '@/components/admin/SiteSettings';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          Settings
        </h1>
        
        <div className="grid gap-6">
          <SiteSettings />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
