
import React from 'react';
import { BookOpen, FilePlus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'note' | 'folder' | 'default';
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'default',
  actionLabel,
  onAction
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'note':
        return <FilePlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />;
      case 'folder':
        return <FolderPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />;
      default:
        return <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />;
    }
  };

  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {getIcon()}
      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
