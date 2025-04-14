
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import HashtagsTable from '@/components/admin/HashtagsTable';

// Sample data for hashtags
const initialHashtags = [
  { name: 'setup', count: 25, addedBy: 'Admin', lastUsed: '2025-04-10' },
  { name: 'momentum', count: 18, addedBy: 'Admin', lastUsed: '2025-04-09' },
  { name: 'breakout', count: 22, addedBy: 'Admin', lastUsed: '2025-04-11' },
  { name: 'technical', count: 15, addedBy: 'Admin', lastUsed: '2025-04-08' },
  { name: 'fundamental', count: 10, addedBy: 'Admin', lastUsed: '2025-04-07' },
];

const AdminHashtags: React.FC = () => {
  const { toast } = useToast();
  const [hashtags, setHashtags] = useState(initialHashtags);

  const handleAddHashtag = (name: string) => {
    const newHashtag = {
      name,
      count: 0,
      addedBy: 'Admin',
      lastUsed: new Date().toISOString().split('T')[0]
    };
    setHashtags([...hashtags, newHashtag]);
    toast({
      title: "Hashtag Added",
      description: `#${name} has been added to the system`
    });
  };

  const handleEditHashtag = (oldName: string, newName: string) => {
    const updatedHashtags = hashtags.map(tag => 
      tag.name === oldName ? { ...tag, name: newName } : tag
    );
    setHashtags(updatedHashtags);
    toast({
      title: "Hashtag Updated",
      description: `#${oldName} has been renamed to #${newName}`
    });
  };

  const handleDeleteHashtag = (name: string) => {
    const updatedHashtags = hashtags.filter(tag => tag.name !== name);
    setHashtags(updatedHashtags);
    toast({
      title: "Hashtag Deleted",
      description: `#${name} has been removed from the system`
    });
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Hashtag Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Manage hashtags used across the platform.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <HashtagsTable 
          hashtags={hashtags}
          onAddHashtag={handleAddHashtag}
          onEditHashtag={handleEditHashtag}
          onDeleteHashtag={handleDeleteHashtag}
        />
      </div>
    </div>
  );
};

export default AdminHashtags;
