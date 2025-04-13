
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import HomepageEditor from '@/components/admin/HomepageEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Home, LayoutTemplate } from 'lucide-react';

const AdminPages: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Pages Management
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
            Edit and manage website pages
          </p>
        </header>
        
        <Tabs defaultValue="homepage" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-md overflow-x-auto flex whitespace-nowrap">
            <TabsTrigger value="homepage" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Homepage</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span>Other Pages</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              <span>Layout</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="homepage" className="space-y-6">
            <HomepageEditor />
          </TabsContent>
          
          <TabsContent value="other" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Other Pages Coming Soon</h3>
              <p className="text-gray-500 dark:text-gray-400">
                The ability to edit additional pages will be available in a future update.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Layout Customization Coming Soon</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Site-wide layout customization options will be available in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPages;
