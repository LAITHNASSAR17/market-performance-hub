
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRADE_TYPES, TradeType } from '@/constants/tradeTypes';

interface TradeTypeSelectorProps {
  selectedType: TradeType;
  onTypeChange: (value: TradeType) => void;
}

const TradeTypeSelector: React.FC<TradeTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div>
      <Label htmlFor="type">Type</Label>
      <Select
        value={selectedType}
        onValueChange={onTypeChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TRADE_TYPES.BUY}>{TRADE_TYPES.BUY}</SelectItem>
          <SelectItem value={TRADE_TYPES.SELL}>{TRADE_TYPES.SELL}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TradeTypeSelector;
