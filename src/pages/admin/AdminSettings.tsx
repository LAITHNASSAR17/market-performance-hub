
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Bell, Shield, Database, FileText } from 'lucide-react';
import SiteSettings from '@/components/admin/SiteSettings';
import SystemSettings from '@/components/admin/SystemSettings';
import SystemSettingsExtended from '@/components/admin/SystemSettingsExtended';

const AdminSettings: React.FC = () => {
  // Get site name from localStorage or default for page title
  const siteName = localStorage.getItem('siteName') || 'TradeTracker';

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Configure and manage global platform settings for {siteName}
        </p>
      </header>
      
      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-md overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="site" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            <span>Site Settings</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>System Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Security & Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="site" className="space-y-6">
          <SiteSettings />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <SystemSettings />
          <SystemSettingsExtended />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SystemSettingsExtended />
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <SystemSettingsExtended />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
