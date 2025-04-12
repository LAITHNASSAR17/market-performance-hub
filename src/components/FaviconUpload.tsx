
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import ImageUpload from '@/components/ImageUpload';

const FaviconUpload: React.FC = () => {
  const { t } = useLanguage();
  const [favicon, setFavicon] = React.useState<string | null>(null);

  const handleFaviconChange = (value: string | null) => {
    setFavicon(value);
  };

  const handleSave = () => {
    if (favicon) {
      // In a real implementation, you would upload this to your server
      // For now, we'll update the favicon link directly in the DOM
      const linkElements = document.querySelectorAll("link[rel*='icon']");
      
      if (linkElements.length > 0) {
        // Update existing favicon links
        linkElements.forEach(link => {
          (link as HTMLLinkElement).href = favicon;
        });
      } else {
        // Create a new favicon link if none exists
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = favicon;
        document.head.appendChild(link);
      }

      toast({
        title: t('settings.faviconUpdated') || "Favicon Updated",
        description: t('settings.faviconUpdatedDesc') || "The website favicon has been updated successfully."
      });
    } else {
      toast({
        title: t('settings.noFaviconSelected') || "No Favicon Selected",
        description: t('settings.pleaseSelectFavicon') || "Please select an image to use as favicon.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {t('settings.favicon') || "Website Favicon"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('settings.faviconDesc') || "Upload an image to use as the website favicon (the icon shown in browser tabs)."}
        </p>
        
        <ImageUpload 
          value={favicon} 
          onChange={handleFaviconChange} 
          className="max-w-[300px]"
        />
        
        <Button onClick={handleSave}>
          {t('settings.saveFavicon') || "Save Favicon"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FaviconUpload;
