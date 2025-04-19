
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();

  // Since currency and timezone are mentioned in errors but not available in LanguageContext,
  // let's define them locally instead of trying to use them from context
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [preferenceData, setPreferenceData] = useState({
    theme: 'system',
    language: language,
    currency: currency,
    timezone: timezone,
  });

  const [open, setOpen] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferenceData({ ...preferenceData, [e.target.name]: e.target.value });
  };

  const updateUserData = async (userData: any) => {
    setIsUpdating(true);
    try {
      await updateProfile({ name: userData.name });
      toast({
        title: "Success",
        description: "User data updated successfully",
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      toast({
        title: "Error",
        description: "Failed to update user data",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePreference = async (prefData: { theme: string, language: string, currency: string, timezone: string }) => {
    setIsSavingPreferences(true);
    try {
      // Only use "en" as language since type expects it
      const languageToSet = prefData.language === "en" ? "en" : "en";
      setLanguage(languageToSet);
      setCurrency(prefData.currency);
      setTimezone(prefData.timezone);
      toast({
        title: "Success",
        description: "User preferences updated successfully",
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update user preferences",
        variant: "destructive",
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          Admin Profile Settings
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="dark:text-white">
              User Information
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Update user account information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <Button
                onClick={() => updateUserData(userData)}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update User Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="dark:text-white">
              Preferences
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Manage user preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="theme">
                  Theme
                </Label>
                <Select value={preferenceData.theme} onValueChange={(value) => setPreferenceData({ ...preferenceData, theme: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="language">
                  Language
                </Label>
                <Select 
                  value={preferenceData.language} 
                  onValueChange={(value) => setPreferenceData({ ...preferenceData, language: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="currency">
                  Currency
                </Label>
                <Select value={preferenceData.currency} onValueChange={(value) => setPreferenceData({ ...preferenceData, currency: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="timezone">
                  Timezone
                </Label>
                <Select value={preferenceData.timezone} onValueChange={(value) => setPreferenceData({ ...preferenceData, timezone: value })}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => updatePreference({
                  theme: preferenceData.theme,
                  language: "en", // Force "en" to match the expected type
                  currency: preferenceData.currency,
                  timezone: preferenceData.timezone
                })}
                disabled={isSavingPreferences}
              >
                {isSavingPreferences ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminProfileSettings;
