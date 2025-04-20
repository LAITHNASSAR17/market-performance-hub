
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Pencil, Save, Globe } from 'lucide-react';

const SiteSettings: React.FC = () => {
  const { toast } = useToast();
  const { siteSettings, updateSettings, loading } = useSiteSettings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    site_name: '',
    company_email: '',
    support_phone: '',
    copyright_text: '',
    theme: 'light',
    language: 'en'
  });
  
  // Load settings on mount
  useEffect(() => {
    if (siteSettings) {
      setFormValues({
        site_name: siteSettings.site_name || 'Trading Platform',
        company_email: siteSettings.company_email || 'support@tradingplatform.com',
        support_phone: siteSettings.support_phone || '+1 (123) 456-7890',
        copyright_text: siteSettings.copyright_text || '© 2025 Trading Platform. All rights reserved.',
        theme: siteSettings.theme || 'light',
        language: siteSettings.language || 'en'
      });
    }
  }, [siteSettings]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    try {
      console.log('Saving site settings:', formValues);
      updateSettings({
        ...formValues,
        id: siteSettings?.id || '',
        created_at: siteSettings?.created_at || '',
        updated_at: siteSettings?.updated_at || ''
      });
      
      setIsEditing(false);
      
      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save site settings",
        variant: "destructive"
      });
    }
  };
  
  const handleCancel = () => {
    if (siteSettings) {
      setFormValues({
        site_name: siteSettings.site_name || 'Trading Platform',
        company_email: siteSettings.company_email || 'support@tradingplatform.com',
        support_phone: siteSettings.support_phone || '+1 (123) 456-7890',
        copyright_text: siteSettings.copyright_text || '© 2025 Trading Platform. All rights reserved.',
        theme: siteSettings.theme || 'light',
        language: siteSettings.language || 'en'
      });
    }
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
              <div className="text-lg font-medium">{formValues.site_name}</div>
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
              <div>{formValues.company_email}</div>
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
              <div>{formValues.support_phone}</div>
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
              <div className="text-sm text-gray-500">{formValues.copyright_text}</div>
            )}
          </div>
          
          {isEditing && (
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;
