
import React from 'react';
import SystemSettingsExtended from '@/components/admin/SystemSettingsExtended';

const AdminSettings: React.FC = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Configure and manage system-wide settings.
        </p>
      </header>

      <SystemSettingsExtended />
    </div>
  );
};

export default AdminSettings;
