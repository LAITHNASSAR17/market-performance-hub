
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DayData {
  day: number;
  date: string;
  trades: number;
  profit: number;
}

interface WeekData {
  days: (DayData | null)[];
  weeklyTotal: number;
  weeklyTrades: number;
  weekNumber: number;
}

interface TradeCalendarProps {
  month: number;
  year: number;
  calendarData: WeekData[];
  onDayClick: (date: string) => void;
  onMonthChange: (month: number, year: number) => void;
  onJournalClick: (date: string) => void;
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({
  month,
  year,
  calendarData,
  onDayClick,
  onMonthChange,
  onJournalClick
}) => {
  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(11, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(0, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg mx-2">
            {format(new Date(year, month, 1), 'MMMM yyyy')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => onJournalClick('')}>
          <Calendar className="h-4 w-4 mr-2" />
          Journal View
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[768px] md:min-w-0">
          <div className="grid grid-cols-7 gap-1">
            <div className="text-sm font-medium text-center p-2">Sun</div>
            <div className="text-sm font-medium text-center p-2">Mon</div>
            <div className="text-sm font-medium text-center p-2">Tue</div>
            <div className="text-sm font-medium text-center p-2">Wed</div>
            <div className="text-sm font-medium text-center p-2">Thu</div>
            <div className="text-sm font-medium text-center p-2">Fri</div>
            <div className="text-sm font-medium text-center p-2">Sat</div>
            
            {calendarData.map((week, weekIndex) => (
              <React.Fragment key={`week-${weekIndex}`}>
                {week.days.map((day, dayIndex) => 
                  day === null ? (
                    <div key={`empty-${weekIndex}-${dayIndex}`} className="p-2"></div>
                  ) : (
                    <div 
                      key={`day-${day.day}`} 
                      className={cn(
                        "border rounded p-2 text-center min-h-[70px] sm:min-h-[80px] cursor-pointer transition-colors",
                        day.profit > 0 ? "bg-green-50 border-green-200 hover:bg-green-100" : 
                        day.profit < 0 ? "bg-red-50 border-red-200 hover:bg-red-100" : 
                        "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      )}
                      onClick={() => onDayClick(day.date)}
                    >
                      <div className="text-sm">{day.day}</div>
                      {day.trades > 0 && (
                        <>
                          <div className={cn(
                            "text-base sm:text-lg font-bold mt-1",
                            day.profit > 0 ? "text-emerald-500" : "text-red-500"
                          )}>
                            {day.profit > 0 ? '+' : ''}{day.profit.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">{day.trades} {day.trades === 1 ? 'trade' : 'trades'}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-1 text-xs h-6 px-2 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJournalClick(day.date);
                            }}
                          >
                            View
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  )
                )}
                
                <div className="col-span-7 mt-1 mb-4 flex justify-end">
                  <div className="w-full sm:w-[200px] bg-gray-50 border rounded-md p-3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Week {week.weekNumber}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {week.weeklyTrades} {week.weeklyTrades === 1 ? 'trade' : 'trades'}
                      </span>
                    </div>
                    <div className={cn(
                      "font-bold text-lg",
                      week.weeklyTotal > 0 ? "text-emerald-600" : week.weeklyTotal < 0 ? "text-red-600" : "text-gray-600"
                    )}>
                      {week.weeklyTotal > 0 ? "+" : ""}{week.weeklyTotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Net P&L for week {week.weekNumber}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeCalendar;
