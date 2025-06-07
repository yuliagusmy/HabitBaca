import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Book } from '../../../types/supabase';
import { syncUserXP } from '../../../utils/syncUserXP';
import BookCompletionModal from './BookCompletionModal';

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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [trackingMode, setTrackingMode] = useState<'pages_read' | 'current_page'>('pages_read');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookComplete, setShowBookComplete] = useState(false);
  const [completedBookData, setCompletedBookData] = useState<any>(null);
  const [completionQuote, setCompletionQuote] = useState('');

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
  "Books don't just go with you, they take you where you've never been.",
  "Read more, learn more, live more.",
  "A book a day keeps reality away.",
  "Let your bookshelf tell your story.",
  "Your mind deserves the nourishment that only reading gives.",
  "Reading opens doors that others don't even know exist.",
  "Get lost in a book and find yourself.",
  "Books are mirrors: you only see in them what you already have inside you.",
  "Turn the page, change your life.",
  "Reading fuels imagination like nothing else.",

  "Setiap halaman adalah langkah menuju impian.",
  "Buku adalah jendela dunia, teruslah membuka lembarannya!",
  "Kamu luar biasa! Satu halaman lagi, satu ilmu lagi.",
  "Bacaan hari ini, inspirasi esok hari.",
  "Teruslah membaca, dunia menantimu!",
  "Konsistensi kecil hari ini, hasil besar nanti.",
  "Buku adalah teman setia di setiap perjalanan hidup.",
  "Satu bab hari ini, satu kemenangan untuk dirimu.",
  "Jadilah pahlawan bagi dirimu sendiri lewat membaca.",
  "Setiap buku adalah petualangan baru. Nikmati!",
  "Membaca membawamu lebih dekat ke impian.",
  "Dunia bisa berubah lewat satu buku yang dibaca seseorang.",
  "Pelan tapi pasti, kamu semakin hebat dengan membaca.",
  "Membaca membuatmu bertumbuh dalam diam.",
  "Hari ini baca, esok jadi luar biasa.",
  "Kamu sudah lebih baik dari kemarin. Teruskan!",
  "Ilmu itu cahaya. Baca terus dan bersinarlah.",
  "Buku adalah investasi terbaik untuk masa depanmu.",
  "Langkah kecilmu hari ini adalah awal perubahan besar.",

  "A chapter a day keeps ignorance away.",
  "Feed your soul with words that matter.",
  "Your future self will thank you for reading today.",
  "One more book, one more reason to grow.",
  "In books we find escape, wisdom, and power.",
  "You don't just finish a book—you become a part of it.",
  "Books shape minds that shape the world.",
  "Read like your dreams depend on it—because they do.",
  "Every finished book is a badge of honor.",
  "The joy of reading is the reward itself.",
  "Unlock your next level—one book at a time.",
  "The more you turn pages, the more you turn life around.",
  "Grow your mindset, one story at a time.",
  "Books are quiet mentors. Let them guide you.",
  "Reading is proof you're committed to yourself.",
  "Every sentence read is an investment in clarity.",
  "Success starts with curiosity—and curiosity loves books.",
  "Read often. Speak wisely.",
  "Wisdom isn't born. It's read, page by page.",

  "Buku tak hanya dibaca, tapi dirasakan.",
  "Setiap buku punya pesan khusus untukmu.",
  "Semakin kamu membaca, semakin kamu bebas.",
  "Ilmu tidak akan berat dibawa, justru meringankan hidup.",
  "Membaca membuatmu peka terhadap dunia.",
  "Hidup penuh warna dengan kata-kata dari buku.",
  "Buku adalah kendaraan waktu. Baca dan jelajahi!",
  "Satu paragraf bisa mengubah arah hidupmu.",
  "Jangan remehkan satu halaman. Itu bisa jadi awal segalanya.",
  "Bacaan ringan hari ini, pemikiran mendalam esok hari.",
  "Kata demi kata, kamu membangun versi terbaik dirimu.",
  "Buku menyimpan kekuatan yang tak terlihat mata.",
  "Baca bukan karena wajib, tapi karena kamu layak untuk tahu lebih.",
  "Pengetahuan adalah bentuk cinta tertinggi pada diri sendiri.",
  "Semangatmu luar biasa! Teruskan jejak membacamu.",
  "Membaca tak pernah sia-sia, meski satu kalimat sehari.",
  "Dengan membaca, kamu membangun masa depanmu diam-diam.",
  "Jadikan membaca sebagai hadiah untuk dirimu sendiri.",
  "Bacaan yang bagus akan menemukanmu di saat yang tepat."
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

      // Reset pages read and current page if book is changed
      setPagesRead(1);
      setCurrentPage(book?.current_page || 0);
    } else {
      setSelectedBook(null);
    }
  }, [selectedBookId, books]);

  useEffect(() => {
    if (isOpen) {
      setShowBookComplete(false);
      setCompletedBookData(null);
      setCompletionQuote('');
    }
  }, [isOpen]);

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

    let actualPagesRead: number;
    let newCurrentPage: number;

    if (trackingMode === 'pages_read') {
      if (!pagesRead || pagesRead <= 0) {
        toast.error('Pages read must be at least 1.');
        return;
      }
      const remainingPages = selectedBook.total_pages - selectedBook.current_page;
      if (pagesRead > remainingPages) {
        toast.error(`You only have ${remainingPages} pages left in this book.`);
        return;
      }
      actualPagesRead = pagesRead;
      newCurrentPage = selectedBook.current_page + actualPagesRead;
    } else {
      if (!currentPage || currentPage <= 0) {
        toast.error('Current page must be at least 1.');
        return;
      }
      if (currentPage > selectedBook.total_pages) {
        toast.error(`This book only has ${selectedBook.total_pages} pages.`);
        return;
      }
      if (currentPage < selectedBook.current_page) {
        toast.error(`You've already read past page ${selectedBook.current_page}.`);
        return;
      }
      newCurrentPage = currentPage;
      actualPagesRead = newCurrentPage - selectedBook.current_page;
    }

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
          date: formatLocalDate(today)
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
      const todayFormatted = formatLocalDate(today);
      const yesterdayFormatted = formatLocalDate(yesterday);
      const lastReadingFormatted = lastReadingDate ? formatLocalDate(lastReadingDate) : null;
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
          last_reading_date: formatLocalDate(today),
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
      const chosenQuote = getRandomQuote();
      if (isBookCompleted) {
        console.log('isBookCompleted:', isBookCompleted, 'newCurrentPage:', newCurrentPage, 'totalPages:', selectedBook.total_pages);
        console.log('Triggering BookCompletionModal...');
        setCompletedBookData({
          coverUrl: selectedBook.cover_url || '',
          title: selectedBook.title,
          author: selectedBook.author,
          totalPages: selectedBook.total_pages,
          genre: selectedBook.genre,
          finishedAt: formatLocalDate(today),
        });
        setCompletionQuote(chosenQuote);
        setShowBookComplete(true);
      } else {
        toast.custom((t) => (
          <div className="fixed top-1/2 left-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="pointer-events-auto bg-white/90 shadow-2xl rounded-2xl px-8 py-7 flex flex-col items-center border-2 border-primary-200"
              style={{ minWidth: 320, maxWidth: 400 }}
            >
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-10 h-10 text-primary-500 drop-shadow-lg animate-bounce" />
              </div>
              <div className="text-xl font-bold text-primary-700 mb-1 flex items-center gap-2">
                Sesi Membaca Ditambahkan!
                <CheckCircle className="w-6 h-6 text-green-500 animate-pulse" />
              </div>
              <div className="text-base text-gray-700 italic mb-2 text-center">"{chosenQuote}"</div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        ), { duration: 5000 });
        onClose();
      }
      setPagesRead(1); // Reset pagesRead after submit
      // Sinkronisasi XP otomatis setelah submit
      await syncUserXP(user.id);
      // Notifikasi XP selalu muncul
      toast.success(`Kamu mendapatkan ${additionalXP} XP!`);
    } catch (error) {
      console.error('Error adding reading session:', error);
      toast.error('Failed to add reading session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date to YYYY-MM-DD (local time)
  function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    <>
      {showBookComplete && completedBookData && (
        <BookCompletionModal
          open={showBookComplete}
          onClose={() => {
            setShowBookComplete(false);
            onClose();
          }}
          book={completedBookData}
          quote={completionQuote}
        />
      )}
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
                <h2 className="text-xl font-bold flex items-center text-white">
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

                    {/* Tracking mode selector */}
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setTrackingMode('pages_read')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                          trackingMode === 'pages_read'
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-500 shadow-sm'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        Pages Read
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrackingMode('current_page')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                          trackingMode === 'current_page'
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-500 shadow-sm'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        Current Page
                      </button>
                    </div>

                    {/* Input field based on tracking mode */}
                    {trackingMode === 'pages_read' ? (
                      <div>
                        <label htmlFor="pagesRead" className="block text-sm font-medium text-gray-700 mb-1">
                          Pages Read Today
                        </label>
                        <input
                          type="number"
                          id="pagesRead"
                          value={pagesRead}
                          onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
                          min="1"
                          max={selectedBook ? selectedBook.total_pages - selectedBook.current_page : 1000}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                          disabled={isLoading}
                        />
                        {selectedBook && (
                          <p className="mt-1 text-sm text-gray-500">
                            Pages remaining: {selectedBook.total_pages - selectedBook.current_page}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="currentPage" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Page
                        </label>
                        <input
                          type="number"
                          id="currentPage"
                          value={currentPage}
                          onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                          min={selectedBook ? selectedBook.current_page + 1 : 1}
                          max={selectedBook ? selectedBook.total_pages : 1000}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                          disabled={isLoading}
                        />
                        {selectedBook && (
                          <p className="mt-1 text-sm text-gray-500">
                            You've read {selectedBook.current_page} pages so far
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !selectedBookId}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding...
                        </span>
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
    </>
  );
};

export default AddReadingModal;