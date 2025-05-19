
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const SystemSettings: React.FC = () => {
  return (
    <div>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system-wide settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500">
            <Settings className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">System Settings Component</h3>
            <p>Please create the SystemSettings component to manage system settings here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
