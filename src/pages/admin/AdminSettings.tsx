
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Settings, Globe, Bell, Shield, Database, FileText, Mail, 
  BrandTelegram, Instagram, Camera, Youtube, MessageSquare,
  Sparkles, Crown, Save, Upload, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Site settings form schema
const siteSettingsSchema = z.object({
  site_name: z.string().min(2, { message: "Site name must be at least 2 characters." }),
  company_email: z.string().email({ message: "Please enter a valid email address." }),
  site_description: z.string().optional(),
  support_phone: z.string().optional(),
  copyright_text: z.string().optional(),
  default_language: z.enum(["en", "ar"]),
  site_logo: z.string().optional()
});

// Email settings form schema
const emailSettingsSchema = z.object({
  smtp_host: z.string().min(1, { message: "SMTP host is required" }),
  smtp_port: z.coerce.number().int().positive(),
  smtp_username: z.string().min(1, { message: "SMTP username is required" }),
  smtp_password: z.string().min(1, { message: "SMTP password is required" }),
  smtp_sender_name: z.string().min(1, { message: "Sender name is required" }),
  smtp_ssl: z.boolean().default(true)
});

// Subscription settings form schema
const subscriptionSettingsSchema = z.object({
  subscription_duration: z.coerce.number().int().positive(),
  subscription_welcome: z.string(),
  auto_activate_vip: z.boolean().default(true)
});

// Social media form schema
const socialMediaSchema = z.object({
  telegram_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  instagram_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  snapchat_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  youtube_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
});

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Site Settings Form
  const siteForm = useForm<z.infer<typeof siteSettingsSchema>>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      site_name: '',
      company_email: '',
      site_description: '',
      support_phone: '',
      copyright_text: '',
      default_language: 'en',
      site_logo: ''
    }
  });

  // Email Settings Form
  const emailForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      smtp_sender_name: '',
      smtp_ssl: true
    }
  });

  // Subscription Settings Form
  const subscriptionForm = useForm<z.infer<typeof subscriptionSettingsSchema>>({
    resolver: zodResolver(subscriptionSettingsSchema),
    defaultValues: {
      subscription_duration: 30,
      subscription_welcome: 'Welcome to your VIP subscription!',
      auto_activate_vip: true
    }
  });

  // Social Media Form
  const socialMediaForm = useForm<z.infer<typeof socialMediaSchema>>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      telegram_link: '',
      instagram_link: '',
      snapchat_link: '',
      youtube_link: ''
    }
  });

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
          
        if (error) {
          console.error('Error fetching settings:', error);
          throw error;
        }
        
        if (data) {
          // Update site settings form
          siteForm.reset({
            site_name: data.site_name || '',
            company_email: data.company_email || '',
            site_description: data.site_description || '',
            support_phone: data.support_phone || '',
            copyright_text: data.copyright_text || '',
            default_language: data.default_language || 'en',
            site_logo: data.site_logo || ''
          });
          
          // Set logo preview if exists
          if (data.site_logo) {
            setLogoPreview(data.site_logo);
          }
          
          // Update email settings form
          emailForm.reset({
            smtp_host: data.smtp_host || '',
            smtp_port: data.smtp_port || 587,
            smtp_username: data.smtp_username || '',
            smtp_password: data.smtp_password || '',
            smtp_sender_name: data.smtp_sender_name || '',
            smtp_ssl: data.smtp_ssl !== false
          });
          
          // Update subscription settings form
          subscriptionForm.reset({
            subscription_duration: data.subscription_duration || 30,
            subscription_welcome: data.subscription_welcome || 'Welcome to your VIP subscription!',
            auto_activate_vip: data.auto_activate_vip !== false
          });
          
          // Update social media form
          socialMediaForm.reset({
            telegram_link: data.telegram_link || '',
            instagram_link: data.instagram_link || '',
            snapchat_link: data.snapchat_link || '',
            youtube_link: data.youtube_link || ''
          });
          
          // Update localStorage with site name
          localStorage.setItem('siteName', data.site_name || 'TradeTracker');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Handle logo file selection
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const fileUrl = URL.createObjectURL(file);
      setLogoPreview(fileUrl);
      siteForm.setValue('site_logo', 'uploading');
    }
  };

  // Handle form submission for site settings
  const onSaveSiteSettings = async (data: z.infer<typeof siteSettingsSchema>) => {
    try {
      let logoUrl = data.site_logo;
      
      // Upload logo if new file is selected
      if (logoFile) {
        const filename = `site-logo-${Date.now()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('public')
          .upload(`logos/${filename}`, logoFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('public')
          .getPublicUrl(`logos/${filename}`);
          
        logoUrl = publicUrlData.publicUrl;
      }
      
      // Update site settings
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: data.site_name,
          company_email: data.company_email,
          site_description: data.site_description,
          support_phone: data.support_phone,
          copyright_text: data.copyright_text,
          default_language: data.default_language,
          site_logo: logoUrl
        })
        .eq('site_name', siteForm.getValues().site_name);
      
      if (error) {
        throw error;
      }
      
      // Update localStorage with new site name
      localStorage.setItem('siteName', data.site_name);
      document.title = data.site_name;
      
      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({
        title: "Error",
        description: "Failed to save site settings",
        variant: "destructive"
      });
    }
  };

  // Handle form submission for email settings
  const onSaveEmailSettings = async (data: z.infer<typeof emailSettingsSchema>) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          smtp_host: data.smtp_host,
          smtp_port: data.smtp_port,
          smtp_username: data.smtp_username,
          smtp_password: data.smtp_password,
          smtp_sender_name: data.smtp_sender_name,
          smtp_ssl: data.smtp_ssl
        })
        .eq('site_name', siteForm.getValues().site_name);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Settings Saved",
        description: "Email settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive"
      });
    }
  };

  // Handle form submission for subscription settings
  const onSaveSubscriptionSettings = async (data: z.infer<typeof subscriptionSettingsSchema>) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          subscription_duration: data.subscription_duration,
          subscription_welcome: data.subscription_welcome,
          auto_activate_vip: data.auto_activate_vip
        })
        .eq('site_name', siteForm.getValues().site_name);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Settings Saved",
        description: "Subscription settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving subscription settings:', error);
      toast({
        title: "Error",
        description: "Failed to save subscription settings",
        variant: "destructive"
      });
    }
  };

  // Handle form submission for social media settings
  const onSaveSocialMedia = async (data: z.infer<typeof socialMediaSchema>) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          telegram_link: data.telegram_link,
          instagram_link: data.instagram_link,
          snapchat_link: data.snapchat_link,
          youtube_link: data.youtube_link
        })
        .eq('site_name', siteForm.getValues().site_name);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Settings Saved",
        description: "Social media links have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving social media links:', error);
      toast({
        title: "Error",
        description: "Failed to save social media links",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Configure and manage global platform settings for {localStorage.getItem('siteName') || 'TradeTracker'}
        </p>
      </header>
      
      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-md overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="site" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            <span>Site Settings</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            <span>Email Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center">
            <Crown className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Social Media</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Security & Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Site Settings Tab */}
        <TabsContent value="site" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Site Settings</CardTitle>
              <CardDescription>
                Configure global site settings and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...siteForm}>
                <form onSubmit={siteForm.handleSubmit(onSaveSiteSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={siteForm.control}
                        name="site_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter site name" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of your site displayed in the browser tab and throughout the UI
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="company_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Official Support Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="support@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Main contact email for support inquiries
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="support_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={siteForm.control}
                        name="site_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of your platform" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description used in meta tags and throughout the site
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="default_language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Site Language</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ar">Arabic</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default language for the platform interface
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="copyright_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Copyright Text</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="© 2025 Your Company. All rights reserved." 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Displayed in the footer of your site
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={siteForm.control}
                      name="site_logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Logo</FormLabel>
                          <div className="flex items-start gap-6">
                            {logoPreview && (
                              <div className="border rounded-md p-2 bg-gray-50 w-32 h-32 flex items-center justify-center">
                                <img 
                                  src={logoPreview} 
                                  alt="Site Logo" 
                                  className="max-w-full max-h-full object-contain" 
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <Button type="button" variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Logo
                                </Button>
                                <Input 
                                  id="logo-upload"
                                  type="file" 
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleLogoUpload}
                                />
                                <FormDescription>
                                  Recommended size: 200x200px (PNG or SVG)
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto" disabled={siteForm.formState.isSubmitting}>
                    {siteForm.formState.isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Site Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Email Settings Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email (SMTP) Configuration</CardTitle>
              <CardDescription>
                Configure email settings for system notifications and messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSaveEmailSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={emailForm.control}
                      name="smtp_host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="587" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={emailForm.control}
                      name="smtp_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={emailForm.control}
                      name="smtp_sender_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Name" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name that will appear as the sender of system emails
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_ssl"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enable SSL/TLS</FormLabel>
                            <FormDescription>
                              Use secure connection for sending emails
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto" disabled={emailForm.formState.isSubmitting}>
                    {emailForm.formState.isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Email Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscription Settings Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>VIP Subscription Settings</CardTitle>
              <CardDescription>
                Configure premium subscription features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...subscriptionForm}>
                <form onSubmit={subscriptionForm.handleSubmit(onSaveSubscriptionSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={subscriptionForm.control}
                      name="subscription_duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Subscription Duration (days)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormDescription>
                            Default number of days for a subscription period
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={subscriptionForm.control}
                      name="subscription_welcome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Welcome Message for New Subscribers</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Welcome message..." 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            This message will be shown to users when they activate a subscription
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={subscriptionForm.control}
                      name="auto_activate_vip"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Auto-activate VIP After Payment</FormLabel>
                            <FormDescription>
                              Automatically activate VIP features immediately after successful payment
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto" disabled={subscriptionForm.formState.isSubmitting}>
                    {subscriptionForm.formState.isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Subscription Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Configure social media platform links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...socialMediaForm}>
                <form onSubmit={socialMediaForm.handleSubmit(onSaveSocialMedia)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={socialMediaForm.control}
                      name="telegram_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <BrandTelegram className="mr-2 h-4 w-4 text-blue-500" />
                              Telegram Link
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://t.me/yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialMediaForm.control}
                      name="instagram_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <Instagram className="mr-2 h-4 w-4 text-pink-500" />
                              Instagram Link
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={socialMediaForm.control}
                      name="snapchat_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <Camera className="mr-2 h-4 w-4 text-yellow-400" />
                              Snapchat Link
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://snapchat.com/add/yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialMediaForm.control}
                      name="youtube_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center">
                              <Youtube className="mr-2 h-4 w-4 text-red-500" />
                              YouTube Link (Optional)
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/c/yourchannel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto" disabled={socialMediaForm.formState.isSubmitting}>
                    {socialMediaForm.formState.isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Social Media Links
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security & Privacy Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy Settings</CardTitle>
              <CardDescription>
                Configure platform security and privacy options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require2fa">Require Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Require 2FA for admin users</p>
                    </div>
                    <Switch id="require2fa" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoLock">Auto-Lock Sessions</Label>
                      <p className="text-sm text-gray-500">Automatically lock inactive sessions after 30 minutes</p>
                    </div>
                    <Switch id="autoLock" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="strongPasswords">Enforce Strong Passwords</Label>
                      <p className="text-sm text-gray-500">Require complex passwords for all users</p>
                    </div>
                    <Switch id="strongPasswords" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="logFailedAttempts">Log Failed Login Attempts</Label>
                      <p className="text-sm text-gray-500">Keep records of failed login attempts</p>
                    </div>
                    <Switch id="logFailedAttempts" defaultChecked />
                  </div>
                </div>
                
                <Button onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "Security settings have been updated"
                  });
                }} className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Configure and manage third-party service integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Google Analytics</h3>
                        <p className="text-sm text-gray-500">Add web analytics tracking</p>
                      </div>
                    </div>
                    <Switch id="googleAnalytics" />
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="trackingId">Tracking ID</Label>
                    <Input id="trackingId" placeholder="UA-XXXXXXXXX-X" className="mt-1" />
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-md">
                        <Sparkles className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Custom API Integration</h3>
                        <p className="text-sm text-gray-500">Connect to external data sources</p>
                      </div>
                    </div>
                    <Switch id="customApi" />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="apiEndpoint">API Endpoint</Label>
                    <Input id="apiEndpoint" placeholder="https://api.example.com/data" className="mt-1" />
                    
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input id="apiKey" type="password" placeholder="Enter API key" className="mt-1" />
                  </div>
                </div>
                
                <Button onClick={() => {
                  toast({
                    title: "Integrations Updated",
                    description: "Integration settings have been saved"
                  });
                }} className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Integration Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
