
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/types/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SystemSettingsExtended = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    id: '',
    site_name: '',
    company_email: '',
    theme: 'light',
    language: 'en',
    created_at: '',
    updated_at: ''
  });
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          ...data,
          company_email: data.company_email || ''
        } as SiteSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: settings.site_name,
          company_email: settings.company_email,
          theme: settings.theme,
          language: settings.language
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "System settings have been updated successfully."
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="siteName">Site Name</label>
            <Input
              id="siteName"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="companyEmail">Company Email</label>
            <Input
              id="companyEmail"
              type="email"
              value={settings.company_email}
              onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default SystemSettingsExtended;
