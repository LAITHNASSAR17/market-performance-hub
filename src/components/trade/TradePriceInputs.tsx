
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TradePriceInputsProps {
  entry: number;
  exit: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TradePriceInputs: React.FC<TradePriceInputsProps> = ({
  entry,
  exit,
  onInputChange
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="entry">Entry Price</Label>
        <Input
          type="number"
          id="entry"
          name="entry"
          value={entry.toString()}
          onChange={onInputChange}
        />
      </div>
      <div>
        <Label htmlFor="exit">Exit Price</Label>
        <Input
          type="number"
          id="exit"
          name="exit"
          value={exit.toString()}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
};

export default TradePriceInputs;
