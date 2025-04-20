
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreferences } from '@/hooks/usePreferences';

export function PreferencesCard() {
  const { preferenceData, setPreferenceData, isSavingPreferences, updatePreference } = usePreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Preferences</CardTitle>
        <CardDescription className="dark:text-gray-300">
          Manage user preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={preferenceData.theme} 
              onValueChange={(value) => setPreferenceData({ ...preferenceData, theme: value })}
            >
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
            <Label htmlFor="language">Language</Label>
            <Select 
              value={preferenceData.language} 
              onValueChange={(value: 'en') => setPreferenceData({ ...preferenceData, language: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={preferenceData.currency} 
              onValueChange={(value) => setPreferenceData({ ...preferenceData, currency: value })}
            >
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
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={preferenceData.timezone} 
              onValueChange={(value) => setPreferenceData({ ...preferenceData, timezone: value })}
            >
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
            onClick={() => updatePreference(preferenceData)}
            disabled={isSavingPreferences}
          >
            {isSavingPreferences ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
