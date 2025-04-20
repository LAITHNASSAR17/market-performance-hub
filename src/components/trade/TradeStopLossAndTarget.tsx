
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TradeStopLossAndTargetProps {
  stopLoss: number;
  takeProfit: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TradeStopLossAndTarget: React.FC<TradeStopLossAndTargetProps> = ({
  stopLoss,
  takeProfit,
  onInputChange
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="stopLoss">Stop Loss</Label>
        <Input
          type="number"
          id="stopLoss"
          name="stopLoss"
          value={stopLoss.toString()}
          onChange={onInputChange}
        />
      </div>
      <div>
        <Label htmlFor="takeProfit">Take Profit</Label>
        <Input
          type="number"
          id="takeProfit"
          name="takeProfit"
          value={takeProfit.toString()}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
};

export default TradeStopLossAndTarget;
