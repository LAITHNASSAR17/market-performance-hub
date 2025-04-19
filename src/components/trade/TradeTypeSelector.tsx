
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TradeTypeSelectorProps {
  selectedType: string;
  onTypeChange: (value: string) => void;
}

const TradeTypeSelector: React.FC<TradeTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div>
      <Label htmlFor="type">Type</Label>
      <Select onValueChange={onTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select type" defaultValue={selectedType} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Buy">Buy</SelectItem>
          <SelectItem value="Sell">Sell</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TradeTypeSelector;
