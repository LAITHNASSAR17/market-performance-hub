import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface FaviconUploadProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const FaviconUpload: React.FC<FaviconUploadProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [favicon, setFavicon] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { updateFavicon } = useSiteSettings();

  React.useEffect(() => {
    // Load favicon from localStorage if available
    const savedFavicon = localStorage.getItem('favicon');
    if (savedFavicon) {
      setFavicon(savedFavicon);
    }
  }, []);

  const handleFaviconChange = (value: string | null) => {
    setFavicon(value);
  };

  const handleSave = () => {
    if (favicon) {
      // Save favicon to localStorage for persistence
      localStorage.setItem('favicon', favicon);
      
      // Update the favicon in the document - make sure updateFavicon accepts a string
      updateFavicon(favicon);

      toast({
        title: t('settings.faviconUpdated') || "Favicon Updated",
        description: t('settings.faviconUpdatedDesc') || "The website favicon has been updated successfully."
      });
      
      // Close the dialog if onClose prop exists
      if (onClose) {
        onClose();
      }
    } else {
      toast({
        title: t('settings.noFaviconSelected') || "No Favicon Selected",
        description: t('settings.pleaseSelectFavicon') || "Please select an image to use as favicon.",
        variant: "destructive"
      });
    }
  };

  // Render as a dialog if isOpen prop is provided
  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {t('settings.favicon') || "Website Favicon"}
            </DialogTitle>
            <DialogDescription>
              {t('settings.faviconDesc') || "Upload an image to use as the website favicon (the icon shown in browser tabs)."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ImageUpload 
              value={favicon} 
              onChange={handleFaviconChange} 
              className="max-w-[300px] mx-auto"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel') || "Cancel"}
            </Button>
            <Button onClick={handleSave}>
              {t('settings.saveFavicon') || "Save Favicon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render as a card if no isOpen prop is provided (default view)
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
