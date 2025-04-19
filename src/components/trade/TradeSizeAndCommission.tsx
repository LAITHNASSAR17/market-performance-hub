
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TradeSizeAndCommissionProps {
  lotSize: number;
  commission: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TradeSizeAndCommission: React.FC<TradeSizeAndCommissionProps> = ({
  lotSize,
  commission,
  onInputChange
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="lotSize">Lot Size</Label>
        <Input
          type="number"
          id="lotSize"
          name="lotSize"
          value={lotSize.toString()}
          onChange={onInputChange}
        />
      </div>
      <div>
        <Label htmlFor="commission">Commission</Label>
        <Input
          type="number"
          id="commission"
          name="commission"
          value={commission.toString()}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
};

export default TradeSizeAndCommission;
