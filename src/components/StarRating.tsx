
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, className }) => {
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
              "w-6 h-6 transition-colors",
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
