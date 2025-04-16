
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  className,
  size = 'medium' 
}) => {
  const getStarSize = () => {
    switch (size) {
      case 'small': return 'w-4 h-4';
      case 'large': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              getStarSize(),
              "transition-colors",
              rating <= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
