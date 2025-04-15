import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTrade } from '@/contexts/TradeContext';
import { Trade } from '@/types/trade';
import { useNavigate } from 'react-router-dom';

const TradeCalendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { trades } = useTrade();
  const navigate = useNavigate();

  const handleTradeClick = (trade: Trade) => {
    navigate(`/tracking/${trade.id}`);
  };

  const filteredTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return date &&
      tradeDate.getFullYear() === date.getFullYear() &&
      tradeDate.getMonth() === date.getMonth() &&
      tradeDate.getDate() === date.getDate();
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className={cn("p-3 pointer-events-auto")}
        />

        {date && filteredTrades.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium">Trades for {format(date, "PPP")}</h3>
            <ul>
              {filteredTrades.map(trade => (
                <li key={trade.id} className="py-2 border-b last:border-b-0">
                  <button
                    onClick={() => handleTradeClick(trade)}
                    className="w-full text-left hover:underline"
                  >
                    {trade.pair} - {trade.type} - {trade.profitLoss}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TradeCalendar;
