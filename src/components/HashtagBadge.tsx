
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HashtagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
  selected?: boolean;
  onClick?: () => void;
}

const HashtagBadge = ({ tag, onRemove, className, size = 'md', selected, onClick }: HashtagBadgeProps) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full",
        selected ? "bg-blue-500 text-white" : "bg-blue-50 text-trading-blue",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      #{tag}
      {onRemove && (
        <button
          type="button"
          className="ml-1 inline-flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className={cn(size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />
        </button>
      )}
    </span>
  );
};

export default HashtagBadge;
