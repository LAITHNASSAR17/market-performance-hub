
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TradePairSelectorProps {
  pairs: string[];
  selectedPair: string;
  onPairChange: (value: string) => void;
  onAddPair: () => void;
}

const TradePairSelector: React.FC<TradePairSelectorProps> = ({
  pairs,
  selectedPair,
  onPairChange,
  onAddPair
}) => {
  return (
    <div>
      <Label htmlFor="pair">Trading Pair</Label>
      <div className="flex items-center gap-2">
        <Select 
          onValueChange={onPairChange} 
          value={selectedPair}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select pair" />
          </SelectTrigger>
          <SelectContent>
            {pairs.map((pair) => (
              <SelectItem key={pair} value={pair}>{pair}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          type="button" 
          size="icon" 
          variant="outline" 
          onClick={onAddPair} 
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TradePairSelector;
