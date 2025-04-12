
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

type TradeData = {
  date: string;
  profitLoss: number;
  count: number;
};

interface TradeCalendarProps {
  tradeData: TradeData[];
  onDayClick?: (date: string) => void;
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ tradeData, onDayClick }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate the day of the week the month starts on (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart);
  
  // Create placeholders for days of previous month
  const prevMonthPlaceholders = Array.from({ length: startDay }, (_, i) => null);
  
  // Calculate month total PL
  const monthTotal = tradeData.reduce((total, data) => {
    const tradeDate = new Date(data.date);
    if (isSameMonth(tradeDate, currentDate)) {
      return total + data.profitLoss;
    }
    return total;
  }, 0);
  
  // Create weekly data
  const calendar = [...prevMonthPlaceholders, ...monthDays];
  const weeks: Array<Array<Date | null>> = [];
  
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }
  
  // Function to get trade data for a specific date
  const getTradeDataForDate = (date: Date): TradeData | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return tradeData.find(data => data.date === dateString);
  };
  
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const getBackgroundColor = (profitLoss: number | undefined) => {
    if (!profitLoss) return '';
    
    if (theme === 'dark') {
      return profitLoss > 0 ? 'bg-teal-900' : profitLoss < 0 ? 'bg-red-900' : '';
    } else {
      return profitLoss > 0 ? 'bg-teal-100' : profitLoss < 0 ? 'bg-red-100' : '';
    }
  };
  
  const getTextColor = (profitLoss: number | undefined) => {
    if (!profitLoss) return '';
    
    if (theme === 'dark') {
      return profitLoss > 0 ? 'text-teal-300' : profitLoss < 0 ? 'text-red-300' : '';
    } else {
      return profitLoss > 0 ? 'text-teal-700' : profitLoss < 0 ? 'text-red-700' : '';
    }
  };
  
  const monthTotalColor = monthTotal > 0 
    ? (theme === 'dark' ? 'text-teal-300' : 'text-teal-600') 
    : (theme === 'dark' ? 'text-red-300' : 'text-red-600');
  
  return (
    <div className="bg-card dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-medium dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
            <span className={`ml-2 ${monthTotalColor}`}>
              {monthTotal > 0 ? '+' : ''}{monthTotal.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
              })}
            </span>
          </h2>
          
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 bg-muted/50 dark:bg-gray-700">
        {['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground dark:text-gray-300">
            {day}
          </div>
        ))}
      </div>
      
      <div className="divide-y dark:divide-gray-700">
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 divide-x dark:divide-gray-700 min-h-[80px]">
            {week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="p-1 bg-muted/20 dark:bg-gray-900/50" />;
              }
              
              const dateString = format(day, 'yyyy-MM-dd');
              const data = getTradeDataForDate(day);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={dateString}
                  className={cn(
                    "p-1 min-h-[100px] transition-colors",
                    getBackgroundColor(data?.profitLoss),
                    isCurrentDay && "ring-2 ring-primary dark:ring-indigo-500",
                    "hover:bg-accent/50 dark:hover:bg-gray-700/70 cursor-pointer"
                  )}
                  onClick={() => onDayClick?.(dateString)}
                >
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-start p-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isCurrentDay && "bg-primary text-primary-foreground dark:bg-indigo-600 dark:text-white rounded-full w-6 h-6 flex items-center justify-center"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {data && (
                        <span className={cn(
                          "text-xs font-semibold",
                          getTextColor(data.profitLoss)
                        )}>
                          {data.profitLoss > 0 ? '+' : ''}
                          {data.profitLoss.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2
                          })}
                        </span>
                      )}
                    </div>
                    
                    {data && data.count > 0 && (
                      <div className="mt-auto p-1">
                        <span className="text-xs font-medium dark:text-gray-300">
                          {data.count} {data.count === 1 ? 'Trade' : 'Trades'}
                        </span>
                        {data.count > 2 && (
                          <div className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                            +{data.count - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeCalendar;
