
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Bell, Shield, Database } from 'lucide-react';
import SiteSettings from '@/components/admin/SiteSettings';
import SystemSettings from '@/components/admin/SystemSettings';
import SystemSettingsExtended from '@/components/admin/SystemSettingsExtended';

const AdminSettings: React.FC = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Configure and manage global platform settings
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
            <Database className="mr-2 h-4 w-4" />
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
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Security & Privacy Settings</h3>
            <p className="text-gray-500">
              This section is under development. Security and privacy settings will be available soon.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Integrations</h3>
            <p className="text-gray-500">
              API integrations and external services configuration will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
