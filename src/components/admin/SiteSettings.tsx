
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Pencil, Save, Globe } from 'lucide-react';

interface SiteSettings {
  site_name: string;
  company_email: string;
  support_phone: string;
  copyright_text: string;
}

const SiteSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Trading Platform',
    company_email: 'support@tradingplatform.com',
    support_phone: '+1 (123) 456-7890',
    copyright_text: '© 2025 Trading Platform. All rights reserved.'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<SiteSettings>(settings);
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setSettings(data);
        setFormValues(data);
      } else {
        // Initialize settings if not exists
        await initializeSettings();
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
      toast({
        title: "Error",
        description: "Failed to load site settings",
        variant: "destructive"
      });
    }
  };
  
  const initializeSettings = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .insert([settings])
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Settings Initialized",
        description: "Default site settings have been created"
      });
    } catch (error) {
      console.error('Error initializing site settings:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(formValues)
        .eq('site_name', settings.site_name);
        
      if (error) throw error;
      
      setSettings(formValues);
      setIsEditing(false);
      
      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully"
      });
      
      // Update document title if site name changed
      if (formValues.site_name !== settings.site_name) {
        document.title = formValues.site_name;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save site settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setFormValues(settings);
    setIsEditing(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Site Settings
          </div>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </CardTitle>
        <CardDescription>
          Configure global site settings and branding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="site_name">Site Name</Label>
            {isEditing ? (
              <Input
                id="site_name"
                name="site_name"
                value={formValues.site_name}
                onChange={handleInputChange}
                placeholder="Enter site name"
              />
            ) : (
              <div className="text-lg font-medium">{settings.site_name}</div>
            )}
          </div>
          
          <Separator />
          
          <div className="grid gap-2">
            <Label htmlFor="company_email">Company Email</Label>
            {isEditing ? (
              <Input
                id="company_email"
                name="company_email"
                type="email"
                value={formValues.company_email}
                onChange={handleInputChange}
                placeholder="Enter company email"
              />
            ) : (
              <div>{settings.company_email}</div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="support_phone">Support Phone</Label>
            {isEditing ? (
              <Input
                id="support_phone"
                name="support_phone"
                value={formValues.support_phone}
                onChange={handleInputChange}
                placeholder="Enter support phone number"
              />
            ) : (
              <div>{settings.support_phone}</div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="copyright_text">Copyright Text</Label>
            {isEditing ? (
              <Input
                id="copyright_text"
                name="copyright_text"
                value={formValues.copyright_text}
                onChange={handleInputChange}
                placeholder="Enter copyright text"
              />
            ) : (
              <div className="text-sm text-gray-500">{settings.copyright_text}</div>
            )}
          </div>
          
          {isEditing && (
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;
