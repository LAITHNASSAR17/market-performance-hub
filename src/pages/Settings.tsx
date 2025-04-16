
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import { FileImage, Palette } from 'lucide-react';
import FaviconUpload from '@/components/FaviconUpload';

const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [faviconModalOpen, setFaviconModalOpen] = React.useState(false);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">
          Settings
        </h1>
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-4 flex w-full sm:w-auto">
            <TabsTrigger value="appearance" className="flex-1">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="favicon" className="flex-1">
              <FileImage className="h-4 w-4 mr-2" />
              Favicon
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Appearance & Theme
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Customize the look of the application, including light/dark mode.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium dark:text-white">
                      Display Mode
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === 'dark' 
                        ? 'Dark mode is currently active'
                        : 'Light mode is currently active'}
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="favicon">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Favicon
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Change the favicon that appears in your browser tab.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium dark:text-white">
                      Current Favicon
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You can change the favicon by clicking the button below.
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/favicon.ico" alt="Current Favicon" className="max-w-full max-h-full" />
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => setFaviconModalOpen(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                  >
                    Upload New Favicon
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Favicon Upload Modal */}
      {faviconModalOpen && (
        <FaviconUpload isOpen={faviconModalOpen} onClose={() => setFaviconModalOpen(false)} />
      )}
    </Layout>
  );
};

export default Settings;
