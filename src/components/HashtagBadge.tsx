
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HashtagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

const HashtagBadge = ({ tag, onRemove, className, size = 'md' }: HashtagBadgeProps) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full bg-blue-50 text-trading-blue",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      #{tag}
      {onRemove && (
        <button
          type="button"
          className="ml-1 inline-flex items-center justify-center"
          onClick={onRemove}
        >
          <X className={cn(size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />
        </button>
      )}
    </span>
  );
};

export default HashtagBadge;
