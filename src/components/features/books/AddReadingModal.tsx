import { motion } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Book } from '../../../types/supabase';

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddReadingModal: React.FC<AddReadingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [pagesRead, setPagesRead] = useState<number>(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const motivationalQuotes = [
    "Every page is a step toward wisdom. Keep going!",
    "Books are the quietest and most constant of friends.",
    "Reading is to the mind what exercise is to the body.",
    "A reader lives a thousand lives before dying.",
    "Today a reader, tomorrow a leader.",
    "The more that you read, the more things you will know.",
    "Reading gives us someplace to go when we have to stay where we are.",
    "A book is a dream that you hold in your hand.",
    "Reading is an exercise in empathy.",
    "The reading of all good books is like conversation with the finest minds.",
  ];

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchBooks();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedBookId) {
      const book = books.find(book => book.id === selectedBookId) || null;
      setSelectedBook(book);

      // Reset pages read if book is changed
      setPagesRead(1);
    } else {
      setSelectedBook(null);
    }
  }, [selectedBookId, books]);

  const fetchBooks = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'reading')
        .order('title');

      if (error) throw error;

      setBooks(data || []);

      // Auto-select a book if there's only one
      if (data && data.length === 1) {
        setSelectedBookId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load your books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedBookId) {
      toast.error('Please select a book.');
      return;
    }
    if (!selectedBook) {
      toast.error('Selected book not found.');
      return;
    }
    if (!pagesRead || pagesRead <= 0) {
      toast.error('Pages read must be at least 1.');
      return;
    }
    const remainingPages = selectedBook.total_pages - selectedBook.current_page;
    if (pagesRead > remainingPages) {
      toast.error(`You only have ${remainingPages} pages left in this book.`);
      return;
    }

    const actualPagesRead = pagesRead;
    const newCurrentPage = selectedBook.current_page + actualPagesRead;
    const isBookCompleted = newCurrentPage >= selectedBook.total_pages;

    setIsLoading(true);
    try {
      const today = new Date();
      // 1. Add reading session
      const { error: sessionError } = await supabase
        .from('reading_sessions')
        .insert({
          user_id: user.id,
          book_id: selectedBookId,
          pages_read: actualPagesRead,
          date: format(today)
        });
      if (sessionError) throw sessionError;
      // 2. Update book progress
      const { error: bookError } = await supabase
        .from('books')
        .update({
          current_page: newCurrentPage,
          status: isBookCompleted ? 'completed' : 'reading',
          updated_at: today.toISOString()
        })
        .eq('id', selectedBookId);
      if (bookError) throw bookError;
      // 3. Update user XP and streak
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profileError) throw profileError;
      let additionalXP = actualPagesRead; // Base XP: 1 page = 1 XP
      // Bonus XP for completing a book
      if (isBookCompleted) {
        if (selectedBook.total_pages < 150) additionalXP += 50;
        else if (selectedBook.total_pages <= 300) additionalXP += 100;
        else additionalXP += 150;
      }
      // Check and update streak
      let streak = profileData.streak || 0;
      let lastReadingDate = profileData.last_reading_date ? new Date(profileData.last_reading_date) : null;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      // Format dates to YYYY-MM-DD for comparison
      const todayFormatted = format(today);
      const yesterdayFormatted = format(yesterday);
      const lastReadingFormatted = lastReadingDate ? format(lastReadingDate) : null;
      // If last reading was yesterday, increment streak
      // If last reading was today already, maintain streak
      // Otherwise reset streak
      if (lastReadingFormatted === yesterdayFormatted) {
        streak += 1;
      } else if (lastReadingFormatted !== todayFormatted) {
        streak = 1;
      }
      // Bonus XP for 7-day streak
      if (streak === 7) {
        additionalXP += 50;
      }
      const newXP = (profileData.xp || 0) + additionalXP;
      // Update user profile
      const { error: updateProfileError } = await supabase
        .from('user_profiles')
        .update({
          xp: newXP,
          streak,
          last_reading_date: format(today),
          updated_at: today.toISOString()
        })
        .eq('user_id', user.id);
      if (updateProfileError) throw updateProfileError;
      // 4. Check if user leveled up
      // This is a simplified version, actual level calculation should be more complex
      const newLevel = calculateLevel(newXP);
      if (newLevel > profileData.level) {
        await supabase
          .from('user_profiles')
          .update({
            level: newLevel
          })
          .eq('user_id', user.id);
        toast.success(`🎉 Level Up! You are now level ${newLevel}!`);
      }
      // Success message with motivational quote
      toast.success(
        <div>
          <p className="font-medium">Reading session added!</p>
          <p className="text-sm mt-1 italic">"{getRandomQuote()}"</p>
          {isBookCompleted && (
            <p className="text-sm mt-2 font-medium text-success-600">
              🎉 Congratulations! You've completed this book!
            </p>
          )}
        </div>,
        { duration: 5000 }
      );
      setPagesRead(1); // Reset pagesRead after submit
      onClose();
    } catch (error) {
      console.error('Error adding reading session:', error);
      toast.error('Failed to add reading session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date to YYYY-MM-DD
  function format(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Simplified level calculation
  function calculateLevel(xp: number): number {
    if (xp < 600) return Math.max(1, Math.floor(xp / 120));
    if (xp < 1600) return Math.max(5, 5 + Math.floor((xp - 600) / 200));
    if (xp < 3050) return Math.max(10, 10 + Math.floor((xp - 1600) / 290));
    // ... and so on for higher levels
    // This is a simplified version
    return Math.max(15, 15 + Math.floor((xp - 3050) / 400));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></motion.div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto z-10 relative overflow-hidden"
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Add Reading Session
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="loading-spinner"></div>
              </div>
            )}

            {books.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No books in progress</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add a book to your reading list first.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 btn-primary"
                >
                  Add a book
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Book selection */}
                  <div>
                    <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Book
                    </label>
                    <select
                      id="book"
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="" disabled>Select a book</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title} by {book.author}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBook && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm">
                        <p className="font-medium">{selectedBook.title}</p>
                        <p className="text-gray-500">{selectedBook.author}</p>
                        <p className="mt-1">
                          <span className="text-sm text-gray-600">Progress: </span>
                          <span className="font-medium">
                            {selectedBook.current_page} / {selectedBook.total_pages} pages
                          </span>
                          <span className="ml-2 text-xs text-primary-600">
                            ({Math.round((selectedBook.current_page / selectedBook.total_pages) * 100)}%)
                          </span>
                        </p>
                        <div className="mt-2 xp-bar-container">
                          <div
                            className="xp-bar-progress"
                            style={{ width: `${(selectedBook.current_page / selectedBook.total_pages) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pages read */}
                  <div>
                    <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
                      Pages Read Today
                    </label>
                    <input
                      type="number"
                      id="pages"
                      value={pagesRead}
                      onChange={(e) => setPagesRead(Math.max(1, parseInt(e.target.value) || 0))}
                      min="1"
                      max={selectedBook ? selectedBook.total_pages - selectedBook.current_page : 1000}
                      className="input-field"
                      required
                    />

                    {selectedBook && (
                      <p className="mt-1 text-sm text-gray-500">
                        Pages remaining: {selectedBook.total_pages - selectedBook.current_page}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-outline"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading || !selectedBookId || pagesRead <= 0}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner mr-2 w-4 h-4 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      'Add Session'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddReadingModal;