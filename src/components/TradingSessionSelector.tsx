
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Clock, Sun, Globe, Combine } from 'lucide-react';

interface TradingSessionSelectorProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const TradingSessionSelector: React.FC<TradingSessionSelectorProps> = ({ 
  value, 
  onValueChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="marketSession">Trading Session (Market Session)</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="marketSession">
          <SelectValue placeholder="Select trading session" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Asia" className="flex items-center">
            <div className="flex items-center">
              <Moon className="h-4 w-4 mr-2 text-indigo-500" />
              <span>Asia</span>
            </div>
          </SelectItem>
          <SelectItem value="London">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span>London</span>
            </div>
          </SelectItem>
          <SelectItem value="New York">
            <div className="flex items-center">
              <Sun className="h-4 w-4 mr-2 text-orange-500" />
              <span>New York</span>
            </div>
          </SelectItem>
          <SelectItem value="London Close">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-purple-500" />
              <span>London Close</span>
            </div>
          </SelectItem>
          <SelectItem value="Overlap">
            <div className="flex items-center">
              <Combine className="h-4 w-4 mr-2 text-green-500" />
              <span>Overlap (London + NY)</span>
            </div>
          </SelectItem>
          <SelectItem value="Other">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              <span>Other</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TradingSessionSelector;
