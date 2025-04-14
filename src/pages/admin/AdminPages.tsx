
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import HomepageEditor from '@/components/admin/HomepageEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Home, LayoutTemplate, Share, FileImage, FileBadge } from 'lucide-react';

const AdminPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState('homepage');
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Pages Management
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
            Edit and manage website pages and content
          </p>
        </header>
        
        <Tabs 
          defaultValue="homepage" 
          className="space-y-6" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-white p-1 rounded-md overflow-x-auto flex whitespace-nowrap">
            <TabsTrigger value="homepage" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Homepage</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center">
              <Share className="mr-2 h-4 w-4" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center">
              <FileImage className="mr-2 h-4 w-4" />
              <span>Media Assets</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center">
              <FileBadge className="mr-2 h-4 w-4" />
              <span>Legal Pages</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="homepage" className="space-y-6">
            <HomepageEditor />
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Configure search engine optimization settings for your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">SEO Management Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    The ability to manage SEO settings will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Assets Management</CardTitle>
                <CardDescription>
                  Upload and manage images, videos and other media files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Media Library Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    The media library functionality will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Customization</CardTitle>
                <CardDescription>
                  Customize the layout and appearance of your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Layout Customization Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Site-wide layout customization options will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Pages</CardTitle>
                <CardDescription>
                  Manage privacy policy, terms of service and other legal pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Legal Pages Editor Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    The ability to edit legal pages will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPages;
