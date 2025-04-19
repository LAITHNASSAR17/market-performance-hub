
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trade } from '@/contexts/TradeContext';

interface DashboardCalendarProps {
  trades: Trade[];
  onDayClick: (date: string) => void;
  onNavigateToJournal: (date: string) => void;
  calendarData: any[];
}

const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  trades,
  onDayClick,
  onNavigateToJournal,
  calendarData
}) => {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-2">
        <CardTitle className="text-lg">{format(new Date(), 'MMMM yyyy')}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => onNavigateToJournal(format(new Date(), 'yyyy-MM-dd'))}>
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
                {week.days.map((day: any, dayIndex: number) => 
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
                              onNavigateToJournal(day.date);
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
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCalendar;
