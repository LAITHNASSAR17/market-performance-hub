
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TradeFormValues } from '../tradeFormSchema';

interface PricePointsProps {
  isStopLossEnabled: boolean;
  setIsStopLossEnabled: (value: boolean) => void;
  isTakeProfitEnabled: boolean;
  setIsTakeProfitEnabled: (value: boolean) => void;
}

const PricePoints: React.FC<PricePointsProps> = ({
  isStopLossEnabled,
  setIsStopLossEnabled,
  isTakeProfitEnabled,
  setIsTakeProfitEnabled
}) => {
  const { register, formState: { errors } } = useFormContext<TradeFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Points</CardTitle>
        <CardDescription>Enter the price points for your trade.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="entry">Entry Price</Label>
          <Input
            type="number"
            id="entry"
            placeholder="e.g., 1.1050"
            {...register('entry', { valueAsNumber: true })}
          />
          {errors.entry && <p className="text-red-500 text-sm mt-1">{errors.entry.message}</p>}
        </div>

        <div>
          <Label htmlFor="exit">Exit Price</Label>
          <Input
            type="number"
            id="exit"
            placeholder="e.g., 1.1075"
            {...register('exit', { valueAsNumber: true })}
          />
          {errors.exit && <p className="text-red-500 text-sm mt-1">{errors.exit.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="stopLoss" checked={isStopLossEnabled} onCheckedChange={setIsStopLossEnabled} />
          <Label htmlFor="stopLoss">Enable Stop Loss</Label>
        </div>

        {isStopLossEnabled && (
          <div>
            <Label htmlFor="stopLoss">Stop Loss Price</Label>
            <Input
              type="number"
              id="stopLoss"
              placeholder="e.g., 1.1025"
              {...register('stopLoss', { valueAsNumber: true })}
            />
            {errors.stopLoss && <p className="text-red-500 text-sm mt-1">{errors.stopLoss.message}</p>}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="takeProfit" checked={isTakeProfitEnabled} onCheckedChange={setIsTakeProfitEnabled} />
          <Label htmlFor="takeProfit">Enable Take Profit</Label>
        </div>

        {isTakeProfitEnabled && (
          <div>
            <Label htmlFor="takeProfit">Take Profit Price</Label>
            <Input
              type="number"
              id="takeProfit"
              placeholder="e.g., 1.1100"
              {...register('takeProfit', { valueAsNumber: true })}
            />
            {errors.takeProfit && <p className="text-red-500 text-sm mt-1">{errors.takeProfit.message}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricePoints;

