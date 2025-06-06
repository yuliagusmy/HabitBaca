import { motion } from 'framer-motion';
import { BookOpen, BookText, Calendar, CheckCircle, ChevronLeft, Edit, PlusSquare, Star, StarHalf, Trash2, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import AddReadingModal from '../components/features/books/AddReadingModal';
import BookCompletionModal from '../components/features/books/BookCompletionModal';
import GenreSelector from '../components/features/books/GenreSelector';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Book, ReadingSession } from '../types/supabase';
import { syncUserXP } from '../utils/syncUserXP';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([]);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Omit<Book, 'genre'> & { genre: string[] }>>({});
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState<any>(null);
  const [achievementQuote, setAchievementQuote] = useState('');

  // Genre options (bisa diambil dari AddBookModal)
  const genreOptions = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Thriller',
    'Romance', 'Historical Fiction', 'Non-fiction', 'Biography',
    'Self-help', 'Business', 'Philosophy', 'Science',
    'Poetry', 'Memoir', 'Travel', 'Religion',
    'History', 'Psychology', 'Cooking', 'Art',
    'Other'
  ];

  useEffect(() => {
    if (id && user) {
      fetchBookData();
    }
  }, [id, user]);

  const fetchBookData = async () => {
    if (!id || !user) return;

    setIsLoading(true);
    try {
      // Fetch book
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (bookError) throw bookError;

      if (bookData) {
        setBook(bookData);
        setFormData(bookData);
      }

      // Fetch reading sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('book_id', id)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (sessionsError) throw sessionsError;

      setReadingSessions(sessionsData || []);

      // Fetch book notes
      const { data: notesData, error: notesError } = await supabase
        .from('book_notes')
        .select('*')
        .eq('book_id', id)
        .eq('user_id', user.id)
        .single();

      if (!notesError && notesData) {
        setNotes(notesData.notes);
        setRating(notesData.rating);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
      toast.error('Failed to load book details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === 'total_pages' || name === 'current_page') {
      setFormData({
        ...formData,
        [name]: Math.max(0, parseInt(value) || 0)
      });
    } else if (name === 'genre') {
      // genre as array
      const currentGenre = Array.isArray(formData.genre) ? formData.genre : typeof formData.genre === 'string' ? [formData.genre] : [];
      if (checked) {
        setFormData({ ...formData, genre: [...currentGenre, value] });
      } else {
        setFormData({ ...formData, genre: currentGenre.filter((g) => g !== value) });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !user || !book) return;

    setIsLoading(true);
    try {
      // Validate current page is not greater than total pages
      if ((formData.current_page || 0) > (formData.total_pages || 0)) {
        throw new Error('Current page cannot be greater than total pages');
      }

      // Update book
      const { error: updateError } = await supabase
        .from('books')
        .update({
          ...formData,
          genre: Array.isArray(formData.genre) ? formData.genre : formData.genre ? [formData.genre] : [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Save notes if book is completed
      if (book.status === 'completed' || formData.status === 'completed') {
        // Check if notes already exist
        const { data: existingNotes, error: checkNotesError } = await supabase
          .from('book_notes')
          .select('id')
          .eq('book_id', id)
          .eq('user_id', user.id)
          .single();

        if (checkNotesError && checkNotesError.code !== 'PGRST116') { // Not found error
          throw checkNotesError;
        }

        if (existingNotes) {
          // Update existing notes
          const { error: updateNotesError } = await supabase
            .from('book_notes')
            .update({
              notes,
              rating,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingNotes.id);

          if (updateNotesError) throw updateNotesError;
        } else {
          // Insert new notes
          const { error: insertNotesError } = await supabase
            .from('book_notes')
            .insert({
              user_id: user.id,
              book_id: id,
              notes,
              rating
            });

          if (insertNotesError) throw insertNotesError;
        }
      }

      toast.success('Book updated successfully');
      fetchBookData();
      setIsEditing(false);
      // Sinkronisasi XP otomatis setelah edit buku
      if (user) await syncUserXP(user.id);
    } catch (error: any) {
      console.error('Error updating book:', error);
      toast.error(error.message || 'Failed to update book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !user || !confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;

    setIsLoading(true);
    try {
      // Delete book notes
      await supabase
        .from('book_notes')
        .delete()
        .eq('book_id', id)
        .eq('user_id', user.id);

      // Delete reading sessions
      await supabase
        .from('reading_sessions')
        .delete()
        .eq('book_id', id)
        .eq('user_id', user.id);

      // Delete book
      const { error: deleteError } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      toast.success('Book deleted successfully');
      // Sinkronisasi XP otomatis setelah hapus buku
      if (user) await syncUserXP(user.id);
      if (refreshProfile) await refreshProfile();
      await new Promise(res => setTimeout(res, 400)); // Delay singkat agar update selesai
      navigate('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      if (i + 1 <= count) {
        return <Star key={i} className="h-5 w-5 text-accent-500 fill-accent-500" />;
      } else if (i + 0.5 <= count) {
        return <StarHalf key={i} className="h-5 w-5 text-accent-500 fill-accent-500" />;
      } else {
        return <Star key={i} className="h-5 w-5 text-gray-300" />;
      }
    });
  };

  const getRandomQuote = () => {
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
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  const handleViewAchievement = () => {
    if (!book) return;

    setAchievementData({
      coverUrl: book.cover_url || '',
      title: book.title,
      author: book.author,
      totalPages: book.total_pages,
      genre: book.genre,
      finishedAt: formatDate(book.updated_at),
    });
    setAchievementQuote(getRandomQuote());
    setShowAchievement(true);
  };

  if (isLoading && !book) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Book not found</h3>
        <p className="text-gray-500 mb-6">
          The book you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => navigate('/books')}
          className="btn-primary"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/books')}
        className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Books
      </button>

      {/* Book details section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Book header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white rounded-t-xl">
          <div className="flex flex-row items-center">
            {/* Book cover kiri */}
            <div className="flex-shrink-0 mr-4 md:mr-8 mb-0">
              {isEditing ? (
                formData.cover_url ? (
                  <img
                    src={formData.cover_url}
                    alt={formData.title || 'Book cover'}
                    className="h-36 w-24 md:h-56 md:w-40 object-cover rounded-xl shadow-lg bg-white border-2 border-white"
                  />
                ) : (
                  <div className="h-36 w-24 md:h-56 md:w-40 flex items-center justify-center bg-gray-100 rounded-xl shadow-lg border-2 border-white">
                    <BookOpen className="h-16 w-16 md:h-20 md:w-20 text-gray-300" />
                  </div>
                )
              ) : (
                book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="h-36 w-24 md:h-56 md:w-40 object-cover rounded-xl shadow-lg bg-white border-2 border-white"
                  />
                ) : (
                  <div className="h-36 w-24 md:h-56 md:w-40 flex items-center justify-center bg-gray-100 rounded-xl shadow-lg border-2 border-white">
                    <BookOpen className="h-16 w-16 md:h-20 md:w-20 text-gray-300" />
                  </div>
                )
              )}
            </div>
            {/* Info buku kanan */}
            <div className="flex-1 w-full min-w-0">
              {!isEditing && (
                <div className="flex justify-end space-x-1 md:space-x-2 mb-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 md:p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                    title="Edit book"
                  >
                    <Edit className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 md:p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                    title="Delete book"
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </button>
                </div>
              )}
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Form fields, tanpa cover image di sini */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-90 border border-transparent rounded-lg text-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-90 border border-transparent rounded-lg text-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Genre
                      </label>
                      <GenreSelector
                        selectedGenres={Array.isArray(formData.genre) ? formData.genre : formData.genre ? [formData.genre] : []}
                        onChange={(genres) => setFormData({ ...formData, genre: genres })}
                        className="bg-white bg-opacity-90"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status || 'wishlist'}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-90 border border-transparent rounded-lg text-gray-800"
                        required
                      >
                        <option value="wishlist">Wishlist</option>
                        <option value="reading">Reading</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Total Pages
                      </label>
                      <input
                        type="number"
                        name="total_pages"
                        value={formData.total_pages || 0}
                        onChange={handleFormChange}
                        min="1"
                        className="w-full px-3 py-2 bg-white bg-opacity-90 border border-transparent rounded-lg text-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Current Page
                      </label>
                      <input
                        type="number"
                        name="current_page"
                        value={formData.current_page || 0}
                        onChange={handleFormChange}
                        min="0"
                        max={formData.total_pages || 1000}
                        className="w-full px-3 py-2 bg-white bg-opacity-90 border border-transparent rounded-lg text-gray-800"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-1">
                        Cover URL (optional)
                      </label>
                      <input
                        type="text"
                        name="cover_url"
                        value={formData.cover_url || ''}
                        onChange={handleFormChange}
                        placeholder="https://example.com/book-cover.jpg"
                        className="w-full px-3 py-2 bg-white bg-opacity-90 border border-transparent rounded-lg text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white rounded-lg text-primary-600 font-medium hover:bg-gray-100 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner mr-2 w-4 h-4 border-primary-600"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl md:text-5xl font-bold mb-1 leading-tight text-white truncate">{book.title}</h1>
                  <p className="text-base text-white text-opacity-90 mb-2 truncate">by {book.author}</p>
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {Array.isArray(book.genre)
                      ? book.genre.map((g) => (
                          <span key={g} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 mr-1 mb-1">
                            <BookOpen className="h-3 w-3 mr-1 text-primary-400" />
                            {g}
                          </span>
                        ))
                      : book.genre && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 mr-1 mb-1">
                            <BookOpen className="h-3 w-3 mr-1 text-primary-400" />
                            {book.genre}
                          </span>
                        )}
                    {book.status === 'reading' && (
                      <span className="badge bg-blue-500 text-xs text-white">
                        Reading
                      </span>
                    )}
                    {book.status === 'completed' && (
                      <span className="badge bg-green-500 text-xs text-white">
                        Completed
                      </span>
                    )}
                    {book.status === 'wishlist' && (
                      <span className="badge bg-yellow-500 text-xs text-white">
                        Wishlist
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white text-opacity-90 mb-2">
                    <div className="flex items-center gap-1">
                      <BookText className="h-4 w-4 mr-1" />
                      {book.current_page} / {book.total_pages} pages
                    </div>
                  </div>
                  {/* Progress bar */}
                  {book.status === 'reading' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-white text-opacity-90 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((book.current_page / book.total_pages) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white"
                          style={{ width: `${(book.current_page / book.total_pages) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Book content */}
        <div className="p-6">
          {/* Book completion indicator */}
          {book.status === 'completed' && !isEditing && (
            <div className="mb-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center bg-success-100 text-success-800 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Completed on {formatDate(book.updated_at)}</span>
              </div>
              <button
                onClick={handleViewAchievement}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                <Trophy className="h-5 w-5" />
                View Achievement
              </button>
            </div>
          )}

          {/* Reading sessions section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Reading Sessions</h2>

              {book.status === 'reading' && (
                <button
                  onClick={() => setIsAddSessionOpen(true)}
                  className="btn-outline text-sm flex items-center gap-1"
                >
                  <PlusSquare className="h-4 w-4" />
                  Add Session
                </button>
              )}
            </div>

            {readingSessions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500">No reading sessions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {readingSessions.map(session => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          {formatDateTime(session.date)}
                        </span>
                      </div>
                      <span className="font-medium text-primary-600">
                        {session.pages_read} page{session.pages_read !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & review section (visible for completed books) */}
          {(book.status === 'completed' || isEditing && formData.status === 'completed') && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes & Review</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Write your thoughts, insights, and key takeaways..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          {star <= rating ? (
                            <Star className="h-6 w-6 text-accent-500 fill-accent-500" />
                          ) : (
                            <Star className="h-6 w-6 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex mr-2">
                      {renderStars(rating)}
                    </div>
                    <span className="text-gray-600">
                      ({rating}/5)
                    </span>
                  </div>

                  {notes ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">No notes added for this book yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <AddReadingModal
        isOpen={isAddSessionOpen}
        onClose={() => {
          setIsAddSessionOpen(false);
          fetchBookData();
        }}
      />

      {showAchievement && achievementData && (
        <BookCompletionModal
          open={showAchievement}
          onClose={() => setShowAchievement(false)}
          book={achievementData}
          quote={achievementQuote}
        />
      )}
    </div>
  );
};

export default BookDetailPage;