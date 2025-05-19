
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface AdminChartsProps {
  className?: string;
}

const AdminCharts: React.FC<AdminChartsProps> = ({ className }) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Admin Charts</CardTitle>
          <CardDescription>Analytics charts will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Charts Coming Soon</h3>
            <p>The analytics charts functionality is under development and will be available in a future update.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
