
import React from 'react';
import { Card } from '@/components/ui/card';
import FaviconUpload from '@/components/FaviconUpload';

interface SystemSettingsExtendedProps {
  // Add any props if needed
}

const SystemSettingsExtended: React.FC<SystemSettingsExtendedProps> = () => {
  return (
    <div className="space-y-6">
      {/* Favicon Upload Component */}
      <FaviconUpload />
    </div>
  );
};

export default SystemSettingsExtended;
