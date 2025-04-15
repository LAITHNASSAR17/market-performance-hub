
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Settings, Shield } from 'lucide-react';
import SystemSettings from '@/components/admin/SystemSettings';

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
            <span>System Settings</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="site" className="space-y-6">
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <div className="text-center py-8 text-gray-500">
            System settings configuration coming soon
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <div className="text-center py-8 text-gray-500">
            Security settings coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
