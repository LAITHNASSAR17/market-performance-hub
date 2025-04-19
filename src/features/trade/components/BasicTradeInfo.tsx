
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TradeFormValues } from '../tradeFormSchema';

const BasicTradeInfo = () => {
  const { register, formState: { errors }, control, setValue } = useFormContext<TradeFormValues>();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Enter the basic details of your trade.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pair">Trading Pair</Label>
          <Input
            type="text"
            id="pair"
            placeholder="e.g., EUR/USD"
            {...register('pair')}
          />
          {errors.pair && <p className="text-red-500 text-sm mt-1">{errors.pair.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="account">Account</Label>
          <Input
            type="text"
            id="account"
            placeholder="e.g., My Broker Account"
            {...register('account')}
          />
          {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="type">Trade Type</Label>
          <Select 
            onValueChange={(value) => setValue('type', value as 'Buy' | 'Sell')} 
            {...register('type')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select trade type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
        </div>
        
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !control._formValues.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {control._formValues.date ? (
                  format(control._formValues.date, "MMMM dd, yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={control._formValues.date}
                onSelect={(date) => setValue('date', date)}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            type="number"
            id="durationMinutes"
            placeholder="e.g., 60"
            {...register('durationMinutes', { valueAsNumber: true })}
          />
          {errors.durationMinutes && <p className="text-red-500 text-sm mt-1">{errors.durationMinutes.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicTradeInfo;

