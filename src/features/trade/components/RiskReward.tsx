
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TradeFormValues } from '../tradeFormSchema';

const RiskReward = () => {
  const { register, formState: { errors } } = useFormContext<TradeFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk & Reward</CardTitle>
        <CardDescription>Enter the risk and reward details for your trade.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="lotSize">Lot Size</Label>
          <Input
            type="number"
            id="lotSize"
            placeholder="e.g., 0.01"
            step="0.01"
            {...register('lotSize', { valueAsNumber: true })}
          />
          {errors.lotSize && <p className="text-red-500 text-sm mt-1">{errors.lotSize.message}</p>}
        </div>

        <div>
          <Label htmlFor="riskPercentage">Risk Percentage</Label>
          <Input
            type="number"
            id="riskPercentage"
            placeholder="e.g., 1"
            {...register('riskPercentage', { valueAsNumber: true })}
          />
          {errors.riskPercentage && <p className="text-red-500 text-sm mt-1">{errors.riskPercentage.message}</p>}
        </div>

        <div>
          <Label htmlFor="profitLoss">Profit/Loss</Label>
          <Input
            type="number"
            id="profitLoss"
            placeholder="e.g., 25.00"
            {...register('profitLoss', { valueAsNumber: true })}
          />
          {errors.profitLoss && <p className="text-red-500 text-sm mt-1">{errors.profitLoss.message}</p>}
        </div>

        <div>
          <Label htmlFor="commission">Commission/Fees</Label>
          <Input
            type="number"
            id="commission"
            placeholder="e.g., 5.00"
            {...register('commission', { valueAsNumber: true })}
          />
          {errors.commission && <p className="text-red-500 text-sm mt-1">{errors.commission.message}</p>}
        </div>

        <div>
          <Label htmlFor="returnPercentage">Return Percentage</Label>
          <Input
            type="number"
            id="returnPercentage"
            placeholder="e.g., 2.5"
            {...register('returnPercentage', { valueAsNumber: true })}
          />
          {errors.returnPercentage && <p className="text-red-500 text-sm mt-1">{errors.returnPercentage.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskReward;

