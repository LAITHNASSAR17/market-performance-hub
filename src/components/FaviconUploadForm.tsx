
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, X, Check } from 'lucide-react';

interface FaviconUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

const FaviconUpload: React.FC<FaviconUploadProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: language === 'ar' ? 'خطأ في الملف' : 'File Error',
          description: language === 'ar' 
            ? 'الرجاء تحميل ملف صورة صالح (PNG، JPG)' 
            : 'Please upload a valid image file (PNG, JPG)',
          variant: 'destructive'
        });
        return;
      }
      
      // Check file size (max 1MB)
      if (selectedFile.size > 1024 * 1024) {
        toast({
          title: language === 'ar' ? 'الملف كبير جدًا' : 'File Too Large',
          description: language === 'ar' 
            ? 'يجب أن يكون حجم الملف أقل من 1 ميجابايت' 
            : 'File size must be less than 1MB',
          variant: 'destructive'
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // Mock upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would upload the file to your server here
    // and get back the URL to the uploaded favicon
    
    // For now, we'll just simulate success
    setUploading(false);
    
    // Update the favicon in the document
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.setAttribute('rel', 'shortcut icon');
    link.setAttribute('href', preview as string);
    document.getElementsByTagName('head')[0].appendChild(link);
    
    toast({
      title: language === 'ar' ? 'تم تحديث أيقونة الموقع' : 'Favicon Updated',
      description: language === 'ar' 
        ? 'تم تحديث أيقونة الموقع بنجاح' 
        : 'Your favicon has been updated successfully',
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {language === 'ar' ? 'تحميل أيقونة الموقع' : 'Upload Favicon'}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {language === 'ar' 
              ? 'قم بتحميل صورة لاستخدامها كأيقونة للموقع في علامة تبويب المتصفح.' 
              : 'Upload an image to use as your website favicon in browser tabs.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {preview ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Favicon Preview" 
                  className="w-24 h-24 object-contain border dark:border-gray-600 rounded-lg"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {file?.name}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="border-2 border-dashed dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' 
                    ? 'اسحب وأفلت ملف صورة هنا أو انقر للاختيار' 
                    : 'Drag and drop image file here or click to browse'}
                </p>
                <input
                  type="file"
                  id="favicon"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Label 
                  htmlFor="favicon" 
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md cursor-pointer text-sm"
                >
                  {language === 'ar' ? 'اختر ملفًا' : 'Browse Files'}
                </Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {language === 'ar' 
                  ? 'الأنواع المدعومة: PNG و JPG. الحد الأقصى للحجم: 1 ميجابايت.' 
                  : 'Supported formats: PNG, JPG. Max size: 1MB.'}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                {language === 'ar' ? 'جارٍ التحميل...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'تحديث الأيقونة' : 'Update Favicon'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FaviconUpload;
