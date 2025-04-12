
import React from 'react';
import DatabaseView from '@/views/admin/DatabaseView';

const AdminDatabase: React.FC = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Database Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Connect to MySQL database and perform operations.
        </p>
      </header>

      <DatabaseView />
    </div>
  );
};

export default AdminDatabase;
