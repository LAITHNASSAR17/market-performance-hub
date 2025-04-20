
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center space-x-2">
        <Select onValueChange={onPairChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select pair" defaultValue={selectedPair} />
          </SelectTrigger>
          <SelectContent>
            {pairs.map((pair) => (
              <SelectItem key={pair} value={pair}>{pair}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" onClick={onAddPair}>
          Add Pair
        </Button>
      </div>
    </div>
  );
};

export default TradePairSelector;
