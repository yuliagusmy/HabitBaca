import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip
} from 'chart.js';
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns';
import { Award, BookOpen, Calendar, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReadingStats {
  totalBooks: number;
  totalPagesRead: number;
  completedBooks: number;
  averagePagesPerDay: number;
  topGenre: string;
  longestStreak: number;
  currentStreak: number;
  monthlyData: { labels: string[]; data: number[] };
}

const ReadingStats: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, currentMonth]);

  const fetchStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Date range for current month
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      // Get reading sessions for the month
      const { data: monthlyReadingSessions, error: monthlyError } = await supabase
        .from('reading_sessions')
        .select('date, pages_read')
        .eq('user_id', user.id)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));

      if (monthlyError) throw monthlyError;

      // Prepare chart data
      const dateMap: {[key: string]: number} = {};
      monthlyReadingSessions?.forEach(session => {
        const date = session.date;
        if (dateMap[date]) {
          dateMap[date] += session.pages_read;
        } else {
          dateMap[date] = session.pages_read;
        }
      });

      const labels = days.map(day => format(day, 'd'));
      const data = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return dateMap[dateStr] || 0;
      });

      // Get all reading sessions
      const { data: allReadingSessions, error: allSessionsError } = await supabase
        .from('reading_sessions')
        .select('pages_read')
        .eq('user_id', user.id);

      if (allSessionsError) throw allSessionsError;

      // Get completed books
      const { data: completedBooks, error: completedError } = await supabase
        .from('books')
        .select('id, genre')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Calculate top genre
      const genreCounts: {[key: string]: number} = {};
      completedBooks?.forEach(book => {
        if (book.genre) {
          genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
        }
      });

      let topGenre = 'None';
      let maxCount = 0;
      for (const [genre, count] of Object.entries(genreCounts)) {
        if (count > maxCount) {
          maxCount = count;
          topGenre = genre;
        }
      }

      // Calculate total pages read
      const totalPagesRead = allReadingSessions?.reduce((sum, session) => sum + session.pages_read, 0) || 0;

      // Calculate average pages per day (for the last 30 days)
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      const { data: recentSessions, error: recentError } = await supabase
        .from('reading_sessions')
        .select('date, pages_read')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo);

      if (recentError) throw recentError;

      const activeDays = new Set(recentSessions?.map(s => s.date)).size || 1;
      const recentPagesRead = recentSessions?.reduce((sum, session) => sum + session.pages_read, 0) || 0;
      const averagePagesPerDay = Math.round(recentPagesRead / activeDays);

      setStats({
        totalBooks: await getTotalBooks() || 0,
        totalPagesRead,
        completedBooks: completedBooks?.length || 0,
        averagePagesPerDay,
        topGenre,
        longestStreak: 0, // Placeholder, calculate properly in a production app
        currentStreak: profile?.streak || 0,
        monthlyData: { labels, data }
      });
    } catch (error) {
      console.error('Error fetching reading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalBooks = async () => {
    if (!user) return 0;

    try {
      const { count, error } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      return count;
    } catch (error) {
      console.error('Error fetching total books count:', error);
      return 0;
    }
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    // Don't allow navigating to future months
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: any) {
            const index = tooltipItems[0].dataIndex;
            const day = stats?.monthlyData.labels[index];
            const month = format(currentMonth, 'MMM');
            return `${month} ${day}`;
          },
          label: function(context: any) {
            const value = context.raw;
            return `${value} page${value !== 1 ? 's' : ''} read`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pages Read',
          font: {
            size: 12,
          },
        },
        ticks: {
          precision: 0,
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const chartData = {
    labels: stats?.monthlyData.labels || [],
    datasets: [
      {
        data: stats?.monthlyData.data || [],
        backgroundColor: 'rgba(109, 40, 217, 0.7)',
        borderColor: 'rgba(109, 40, 217, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(109, 40, 217, 0.9)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-full">
              <BookOpen className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Books</div>
              <div className="text-xl font-semibold">
                {isLoading ? '-' : stats?.totalBooks || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-secondary-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Pages Read</div>
              <div className="text-xl font-semibold">
                {isLoading ? '-' : stats?.totalPagesRead.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-accent-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Current Streak</div>
              <div className="text-xl font-semibold">
                {isLoading ? '-' : `${stats?.currentStreak || 0} days`}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-success-100 p-2 rounded-full">
              <Award className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Completed Books</div>
              <div className="text-xl font-semibold">
                {isLoading ? '-' : stats?.completedBooks || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Monthly Reading</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-sm font-medium text-gray-700">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Next month"
              disabled={addMonths(currentMonth, 1) > new Date()}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Top Genre</h3>
          <div className="text-xl font-medium text-primary-700">
            {isLoading ? '-' : stats?.topGenre || 'None'}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Daily Average</h3>
          <div className="text-xl font-medium text-primary-700">
            {isLoading ? '-' : `${stats?.averagePagesPerDay || 0} pages`}
          </div>
          <p className="text-xs text-gray-500">Based on active reading days (last 30 days)</p>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Completion Rate</h3>
          <div className="text-xl font-medium text-primary-700">
            {isLoading || !stats ? '-' : `${stats.completedBooks}/${stats.totalBooks} books`}
          </div>
          <p className="text-xs text-gray-500">
            {isLoading || !stats ? '' :
              `${Math.round((stats.completedBooks / (stats.totalBooks || 1)) * 100)}% completion rate`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingStats;