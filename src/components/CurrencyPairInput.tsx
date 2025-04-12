
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Info } from 'lucide-react';

interface CurrencyPairInputProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder?: string;
  error?: string;
  className?: string;
  tooltipText?: string;
}

const CurrencyPairInput: React.FC<CurrencyPairInputProps> = ({
  value,
  onChange,
  options = [],
  placeholder = "Enter currency pair or symbol",
  error,
  className,
  tooltipText
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(error ? 'border-red-500' : '', className)}
        />
        {tooltipText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CurrencyPairInput;
