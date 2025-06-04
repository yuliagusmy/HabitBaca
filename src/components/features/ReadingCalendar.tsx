import { addYears, endOfYear, format, getDay, getMonth, getYear, startOfWeek, startOfYear, subYears } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ReadingCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [readingData, setReadingData] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const todayCellRef = useRef<HTMLDivElement>(null);

  // Tahun yang sedang ditampilkan
  const currentYear = getYear(currentDate);

  // Hitung grid untuk satu tahun penuh
  const { yearStart, yearEnd, weeks } = useMemo(() => {
    const start = startOfYear(new Date(currentYear, 0, 1));
    const end = endOfYear(new Date(currentYear, 0, 1));
    // Mulai dari minggu pertama (Minggu sebelum 1 Jan)
    const firstDay = startOfWeek(start, { weekStartsOn: 0 });
    // Hitung semua hari dalam grid
    const days: Date[] = [];
    let d = new Date(firstDay);
    while (d <= end || getDay(d) !== 0) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    // Kelompokkan per minggu
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return { yearStart: start, yearEnd: end, weeks };
  }, [currentYear]);

  // Navigasi tahun
  const prevYear = useCallback(() => {
    setCurrentDate(subYears(currentDate, 1));
  }, [currentDate]);
  const nextYear = useCallback(() => {
    const next = addYears(currentDate, 1);
    if (next <= new Date()) {
      setCurrentDate(next);
    }
  }, [currentDate]);

  // Ambil data satu tahun penuh
  useEffect(() => {
    const fetchReadingData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const startDate = format(yearStart, 'yyyy-MM-dd');
        const endDate = format(yearEnd, 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('reading_sessions')
          .select('date, pages_read')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
        if (error) throw error;
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
  }, [user, yearStart, yearEnd]);

  // Warna cell
  const getCellColor = useCallback((date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const pagesRead = readingData[dateString] || 0;
    if (pagesRead === 0) return 'bg-white border border-gray-200';
    if (pagesRead < 10) return 'bg-green-100';
    if (pagesRead < 15) return 'bg-green-300';
    if (pagesRead < 20) return 'bg-green-500';
    return 'bg-green-700';
  }, [readingData]);

  // Cell kalender
  const CalendarCell = useCallback(({ day }: { day: Date }) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const pagesRead = readingData[dateString] || 0;
    const isCurrentYear = getYear(day) === currentYear;
    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    return (
      <div
        key={dateString}
        ref={isToday ? todayCellRef : undefined}
        className={`group w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] flex items-center justify-center ${getCellColor(day)} ${isCurrentYear ? '' : 'opacity-30'} ${isToday ? 'ring-2 ring-blue-400' : ''}`}
        title={`${format(day, 'MMM d')}: ${pagesRead} pages`}
      >
        <div className="absolute z-10 hidden group-hover:block">
          <div className="bg-gray-800 text-white text-[12px] rounded py-1 px-2 whitespace-nowrap">
            {format(day, 'MMM d')}: {pagesRead} pages
          </div>
        </div>
      </div>
    );
  }, [readingData, getCellColor, currentYear]);

  // Label bulan (posisi minggu pertama bulan tsb)
  const monthLabels = useMemo(() => {
    const labels: { month: string, col: number }[] = [];
    let lastMonth: number | null = null;
    weeks.forEach((week, colIdx) => {
      const firstDay = week[0];
      const m = getMonth(firstDay);
      if (m !== lastMonth) {
        labels.push({ month: MONTHS[m], col: colIdx });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  // Scroll ke cell hari ini setelah render (jika tahun sekarang)
  useEffect(() => {
    if (!isLoading && getYear(new Date()) === currentYear && todayCellRef.current && gridContainerRef.current) {
      todayCellRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [isLoading, currentYear]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xs font-semibold text-gray-800">Reading Calendar</h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={prevYear}
            className="p-0.5 rounded-full hover:bg-gray-100"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h3 className="text-xs font-medium text-gray-700">
            {currentYear}
          </h3>
          <button
            onClick={nextYear}
            className="p-0.5 rounded-full hover:bg-gray-100"
            aria-label="Next year"
            disabled={addYears(currentDate, 1) > new Date()}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="overflow-x-auto" ref={gridContainerRef}>
          {/* Label bulan */}
          <div className="flex ml-12 mb-2">
            {monthLabels.map(({ month, col }, idx) => (
              <div
                key={month}
                style={{ marginLeft: idx === 0 ? 0 : `${(col - monthLabels[idx - 1].col) * 32}px` }}
                className="text-sm font-medium text-gray-500"
              >
                {month}
              </div>
            ))}
          </div>
          <div className="flex">
            {/* Label hari */}
            <div className="flex flex-col mr-2">
              {DAYS.map((day, i) => (
                (i % 2 === 1) ? (
                  <div key={day} className="h-7 sm:h-8 text-[12px] text-gray-400 flex items-center justify-end pr-2" style={{ height: '32px' }}>{day[0]}</div>
                ) : (
                  <div key={day} className="h-7 sm:h-8" style={{ height: '32px' }}></div>
                )
              ))}
            </div>
            {/* Grid kalender */}
            <div className="flex">
              {weeks.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col">
                  {week.map((day, rowIdx) => (
                    <CalendarCell key={rowIdx} day={day} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 flex items-center space-x-3 text-[12px] text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 border border-gray-200 bg-white rounded-[3px]"></div>
              <span>0</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-green-100 rounded-[3px]"></div>
              <span>1-9</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-green-300 rounded-[3px]"></div>
              <span>10-14</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-green-500 rounded-[3px]"></div>
              <span>15-19</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-green-700 rounded-[3px]"></div>
              <span>20+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingCalendar;