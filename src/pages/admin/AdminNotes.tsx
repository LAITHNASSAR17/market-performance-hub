
import React from 'react';
import { Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminNotes: React.FC = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Notes Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          View and manage all user notes.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row mb-4 gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 pr-4"
              placeholder="Search notes..."
            />
          </div>
        </div>
        
        <div className="p-8 text-center text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Notes Module Coming Soon</h3>
          <p>The notes management functionality is under development and will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminNotes;
