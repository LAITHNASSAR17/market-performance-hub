import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trade } from '@/types/trade';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface TradeCalendarProps {
  trades?: Trade[];
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades = [] }) => {
  const [value, onChange] = React.useState(new Date());

  // Function to check if a date has any trades
  const hasTrades = (date: Date): boolean => {
    return trades.some(trade => {
      const tradeDate = new Date(trade.date);
      return (
        tradeDate.getFullYear() === date.getFullYear() &&
        tradeDate.getMonth() === date.getMonth() &&
        tradeDate.getDate() === date.getDate()
      );
    });
  };

  // Function to add a class name to dates with trades
  const tileClassName = ({ date, view }: { date: Date; view: 'month' | 'year' | 'decade' }) => {
    if (view === 'month' && hasTrades(date)) {
      return 'has-trades';
    }
    return null;
  };

  return (
    <Calendar
      onChange={onChange}
      value={value}
      tileClassName={tileClassName}
    />
  );
};

export default TradeCalendar;
