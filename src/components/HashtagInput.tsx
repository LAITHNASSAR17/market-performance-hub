
import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import HashtagBadge from './HashtagBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HashtagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const HashtagInput: React.FC<HashtagInputProps> = ({
  value,
  onChange,
  suggestions = [],
  id,
  placeholder = "Add hashtags",
  disabled = false,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/^#/, ''); // Remove # if user types it
    setInputValue(newValue);
    
    if (newValue) {
      setShowSuggestions(true);
      setFilteredSuggestions(
        suggestions.filter(s => 
          !value.includes(s) && s.toLowerCase().includes(newValue.toLowerCase())
        ).slice(0, 5)
      );
    } else {
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !value.includes(normalizedTag)) {
      onChange([...value, normalizedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <HashtagBadge
            key={tag}
            tag={tag}
            onRemove={() => removeTag(tag)}
          />
        ))}
      </div>
      
      <div className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Hash className="h-4 w-4" />
            </span>
            <Input
              ref={inputRef}
              id={id}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pl-9"
              disabled={disabled}
              onFocus={() => {
                if (inputValue && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking on them
                setTimeout(() => setShowSuggestions(false), 150);
              }}
            />
          </div>
          {inputValue && (
            <Button 
              type="button" 
              variant="outline" 
              className="ml-2"
              onClick={() => addTag(inputValue)}
            >
              Add
            </Button>
          )}
        </div>
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
            {filteredSuggestions.map(suggestion => (
              <li
                key={suggestion}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                onClick={() => {
                  addTag(suggestion);
                  inputRef.current?.focus();
                }}
              >
                <div className="flex items-center">
                  <Hash className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="font-normal truncate">{suggestion}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HashtagInput;
