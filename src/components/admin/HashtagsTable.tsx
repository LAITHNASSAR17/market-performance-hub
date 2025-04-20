
import React from 'react';
import { Hash } from 'lucide-react';

interface Hashtag {
  name: string;
  count: number;
  addedBy: string;
  lastUsed: string;
}

interface HashtagsTableProps {
  hashtags: Hashtag[];
  onAddHashtag: (name: string) => void;
  onEditHashtag: (oldName: string, newName: string) => void;
  onDeleteHashtag: (name: string) => void;
}

const HashtagsTable: React.FC<HashtagsTableProps> = (props) => {
  return (
    <div>
      <div className="text-center p-8 text-gray-500">
        <Hash className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Hashtags Table Component</h3>
        <p>Please create the HashtagsTable component to display hashtag data here.</p>
      </div>
    </div>
  );
};

export default HashtagsTable;
