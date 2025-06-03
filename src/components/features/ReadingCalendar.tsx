import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getMonth, getYear } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

const ReadingCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [readingData, setReadingData] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);

  // Get days in current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Previous and next month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(getYear(currentDate), getMonth(currentDate) - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(getYear(currentDate), getMonth(currentDate) + 1, 1));
  };

  // Fetch reading data for the month
  useEffect(() => {
    const fetchReadingData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const startDate = format(monthStart, 'yyyy-MM-dd');
        const endDate = format(monthEnd, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('reading_sessions')
          .select('date, pages_read')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
        
        if (error) throw error;
        
        // Process data into a date -> pages read map
        const dateMap: {[key: string]: number} = {};
        data?.forEach(session => {
          const date = session.date;
          if (dateMap[date]) {
            dateMap[date] += session.pages_read;
          } else {
            dateMap[date] = session.pages_read;
          }
        });
        
        setReadingData(dateMap);
      } catch (error) {
        console.error('Error fetching reading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadingData();
  }, [user, monthStart, monthEnd]);

  // Get cell color based on pages read
  const getCellColor = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const pagesRead = readingData[dateString] || 0;
    
    if (pagesRead === 0) return 'bg-gray-200';
    if (pagesRead < 10) return 'bg-success-200';
    if (pagesRead < 15) return 'bg-success-300';
    if (pagesRead < 20) return 'bg-success-400';
    return 'bg-success-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Reading Calendar</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-sm font-medium text-gray-700">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateString = format(day, 'yyyy-MM-dd');
              const pagesRead = readingData[dateString] || 0;
              
              return (
                <div 
                  key={dateString}
                  className="relative group"
                >
                  <div 
                    className={`calendar-cell ${getCellColor(day)}`}
                    title={`${format(day, 'MMM d')}: ${pagesRead} pages`}
                  ></div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {format(day, 'MMM d')}: {pagesRead} pages
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
              <span>0 pages</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-200 rounded-sm"></div>
              <span>1-9 pages</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-300 rounded-sm"></div>
              <span>10-14 pages</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-400 rounded-sm"></div>
              <span>15-19 pages</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-sm"></div>
              <span>20+ pages</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReadingCalendar;