import { motion } from 'framer-motion';
import { BookOpen, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ReadingCalendar from '../components/features/ReadingCalendar';
import BookCard from '../components/features/books/BookCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Book, ReadingSession } from '../types/supabase';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [currentBooks, setCurrentBooks] = useState<Book[]>([]);
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch books in progress
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'reading')
        .order('updated_at', { ascending: false })
        .limit(4);

      if (booksError) throw booksError;

      // Add calculated progress field to books
      const booksWithProgress = booksData?.map(book => ({
        ...book,
        progress: Math.round((book.current_page / book.total_pages) * 100)
      })) || [];

      setCurrentBooks(booksWithProgress);

      // Fetch recent reading sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('reading_sessions')
        .select(`
          id, book_id, pages_read, date,
          books:book_id (
            id, title, author
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (sessionsError) throw sessionsError;

      setRecentSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getWelcomeMessage()}, Reader!
        </h1>
        <p className="text-gray-600">
          Track your reading progress and build your habit.
        </p>
      </motion.div>

      {/* Reading Calendar */}
      <ReadingCalendar />

      {/* Current Books */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Books In Progress</h2>
          <Link to="/books" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="loading-spinner"></div>
          </div>
        ) : currentBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books in progress</h3>
            <p className="text-gray-500 mb-6">
              Start tracking your reading by adding a book to your collection.
            </p>
            <Link to="/books" className="btn-primary inline-flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {currentBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Reading Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loading-spinner"></div>
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-500">
              No recent reading sessions. Start tracking your reading!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <BookOpen className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.book?.title || 'Unknown Book'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.book?.author || 'Unknown Author'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-primary-700 font-medium">
                        {session.pages_read} pages
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(session.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;