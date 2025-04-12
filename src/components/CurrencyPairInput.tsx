
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';

interface CurrencyPairInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  error?: string;
  onAddTrade?: () => void; // New prop to trigger trade addition
}

const CurrencyPairInput: React.FC<CurrencyPairInputProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select or type currency pair",
  className,
  error,
  onAddTrade
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle selection from dropdown
  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setInputValue(currentValue);
    
    // Call onAddTrade if provided and reset dropdown
    if (onAddTrade) {
      onAddTrade();
    }
    
    setOpen(false);
  };

  // Handle direct input when user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // Filtered options based on current input
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className={cn("flex w-full items-center", className)}>
            <Input
              ref={inputRef}
              className={cn(
                "w-full",
                error ? "border-red-500" : ""
              )}
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setOpen(true)}
            />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="absolute right-0 h-full px-3"
              onClick={() => setOpen(!open)}
            >
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
          <Command>
            <CommandInput
              placeholder={t('addTrade.searchSymbols') || "Search symbols..."}
              className="h-9"
            />
            <CommandList>
              {filteredOptions.length === 0 && (
                <CommandEmpty>
                  {t('addTrade.noResults') || "No results found. Type to add a custom symbol."}
                </CommandEmpty>
              )}
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    {option}
                    {value === option && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CurrencyPairInput;
