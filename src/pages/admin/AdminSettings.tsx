
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Paintbrush, Settings, Globe, Mail, Phone, Copyright } from 'lucide-react';
import FaviconUpload from '@/components/FaviconUpload';
import { useAuth } from '@/contexts/AuthContext';
import SystemSettings from '@/components/admin/SystemSettings';
import SystemSettingsExtended from '@/components/admin/SystemSettingsExtended';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Site Settings State
  const [siteName, setSiteName] = useState('TradeTracker');
  const [companyEmail, setCompanyEmail] = useState('support@tradetracker.com');
  const [supportPhone, setSupportPhone] = useState('+1 (555) 123-4567');
  const [copyrightText, setCopyrightText] = useState('© 2025 TradeTracker. All rights reserved.');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load site settings from localStorage or Supabase
    const loadSiteSettings = async () => {
      try {
        // Try to load from Supabase first
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        
        if (error || !data) {
          // If Supabase fails, use localStorage
          const storedSiteName = localStorage.getItem('siteName');
          if (storedSiteName) setSiteName(storedSiteName);
          
          const storedCompanyEmail = localStorage.getItem('companyEmail');
          if (storedCompanyEmail) setCompanyEmail(storedCompanyEmail);
          
          const storedSupportPhone = localStorage.getItem('supportPhone');
          if (storedSupportPhone) setSupportPhone(storedSupportPhone);
          
          const storedCopyrightText = localStorage.getItem('copyrightText');
          if (storedCopyrightText) setCopyrightText(storedCopyrightText);
        } else {
          // Use Supabase data
          setSiteName(data.site_name);
          setCompanyEmail(data.company_email);
          setSupportPhone(data.support_phone || '');
          setCopyrightText(data.copyright_text || '');
          
          // Also update localStorage
          localStorage.setItem('siteName', data.site_name);
          localStorage.setItem('companyEmail', data.company_email);
          if (data.support_phone) localStorage.setItem('supportPhone', data.support_phone);
          if (data.copyright_text) localStorage.setItem('copyrightText', data.copyright_text);
        }
      } catch (error) {
        console.error('Error loading site settings:', error);
      }
    };
    
    loadSiteSettings();
  }, []);
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('siteName', siteName);
      localStorage.setItem('companyEmail', companyEmail);
      localStorage.setItem('supportPhone', supportPhone);
      localStorage.setItem('copyrightText', copyrightText);
      
      // Try to save to Supabase
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          site_name: siteName,
          company_email: companyEmail,
          support_phone: supportPhone,
          copyright_text: copyrightText
        }, { onConflict: 'site_name' });
      
      if (error) {
        throw error;
      }
      
      // Success
      toast({
        title: "Settings saved",
        description: "Your site settings have been updated successfully."
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your application settings</p>
        </div>
      </div>
      
      <Tabs defaultValue="site">
        <TabsList className="mb-4">
          <TabsTrigger value="site" data-value="site">Site</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Site Information
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardTitle>
              <CardDescription>
                Customize your site information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input 
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your site name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <div className="flex">
                    <div className="bg-gray-100 dark:bg-gray-800 flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="companyEmail"
                      type="email"
                      className="rounded-l-none"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter company email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <div className="flex">
                    <div className="bg-gray-100 dark:bg-gray-800 flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="supportPhone"
                      type="tel"
                      className="rounded-l-none"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter support phone"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="copyrightText">Copyright Text</Label>
                  <div className="flex">
                    <div className="bg-gray-100 dark:bg-gray-800 flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600">
                      <Copyright className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="copyrightText"
                      className="rounded-l-none"
                      value={copyrightText}
                      onChange={(e) => setCopyrightText(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter copyright text"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="justify-end border-t pt-4">
                <Button variant="default" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5 text-blue-500" />
                  Site Appearance
                </CardTitle>
                <CardDescription>
                  Customize your site appearance including favicon and styling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Favicon</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Upload a custom favicon for your site (recommended size: 32x32px)
                  </p>
                  <FaviconUpload />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for a better viewing experience in low-light environments
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <Switch id="reduce-motion" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduce the amount of animations and transitions
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  <Button variant="outline" className="h-8 w-8 rounded-full bg-blue-500" />
                  <Button variant="outline" className="h-8 w-8 rounded-full bg-purple-500" />
                  <Button variant="outline" className="h-8 w-8 rounded-full bg-green-500" />
                  <Button variant="outline" className="h-8 w-8 rounded-full bg-red-500" />
                  <Button variant="outline" className="h-8 w-8 rounded-full bg-orange-500" />
                  <Button variant="outline" className="h-8 w-8 rounded-full bg-pink-500" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Theme Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="advanced">
          <SystemSettingsExtended />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
