
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Pencil, Save, Globe } from 'lucide-react';

// This component has been migrated to AdminSettings.tsx
// This is a simplified version for backward compatibility
const SiteSettings: React.FC = () => {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState(localStorage.getItem('siteName') || 'TradeTracker');
  
  const handleSave = () => {
    toast({
      title: "Settings moved",
      description: "Please use the site settings tab for full configuration options."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Site Settings
          </div>
        </CardTitle>
        <CardDescription>
          Site settings have moved to the Site Settings tab for improved organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 text-center">
          <p className="mb-4">For full site configuration options, please use the Site Settings tab.</p>
          <Button 
            variant="default"
            onClick={() => document.querySelector('[data-value="site"]')?.dispatchEvent(new MouseEvent('click'))}
          >
            Go to Site Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;
