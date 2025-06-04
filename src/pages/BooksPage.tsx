import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Grid, List, PlusCircle, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AddBookModal from '../components/features/books/AddBookModal';
import BookCard from '../components/features/books/BookCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Book } from '../types/supabase';

const BooksPage: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed' | 'wishlist'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [books, searchTerm, filter]);

  const fetchBooks = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Fetching books for user:', user.id);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      console.log('Books data:', data);
      if (error) throw error;

      // Add calculated progress field to books
      const booksWithProgress = data?.map(book => ({
        ...book,
        progress: Math.round((book.current_page / book.total_pages) * 100)
      })) || [];

      setBooks(booksWithProgress);
      setFilteredBooks(booksWithProgress);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load your books');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = books;

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(book => book.status === filter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.genre.toLowerCase().includes(term)
      );
    }

    setFilteredBooks(result);
  };

  const statusCounts = {
    all: books.length,
    reading: books.filter(book => book.status === 'reading').length,
    completed: books.filter(book => book.status === 'completed').length,
    wishlist: books.filter(book => book.status === 'wishlist').length
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Books</h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center self-start sm:self-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Book
        </motion.button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Status filter */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilter('reading')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
              filter === 'reading'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Reading ({statusCounts.reading})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed ({statusCounts.completed})
          </button>
          <button
            onClick={() => setFilter('wishlist')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
              filter === 'wishlist'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Wishlist ({statusCounts.wishlist})
          </button>
        </div>

        {/* Search and view options */}
        <div className="flex gap-2 ml-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
              title="Grid view"
            >
              <Grid className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
              title="List view"
            >
              <List className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Book list/grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No books found" : "Your book collection is empty"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search or filters"
              : "Start adding books to your collection"
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary inline-flex items-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Your First Book
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBooks.map(book => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredBooks.map(book => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <a href={`/books/${book.id}`} className="flex items-center">
                      {/* Book cover or placeholder */}
                      <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center mr-4 overflow-hidden">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        )}
                      </div>

                      {/* Book details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-500">{book.author}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="badge-secondary text-xs">{book.genre}</span>
                          {book.status === 'reading' && <span className="badge-primary text-xs">Reading</span>}
                          {book.status === 'completed' && <span className="badge-success text-xs">Completed</span>}
                          {book.status === 'wishlist' && <span className="badge-accent text-xs">Wishlist</span>}
                        </div>
                      </div>

                      {/* Progress or status */}
                      <div className="ml-4 text-right">
                        {book.status === 'reading' && (
                          <div>
                            <span className="text-primary-600 font-medium">{book.progress}%</span>
                            <p className="text-xs text-gray-500">
                              {book.current_page}/{book.total_pages} pages
                            </p>
                          </div>
                        )}
                        {book.status === 'completed' && (
                          <span className="text-success-600 text-sm font-medium">Completed</span>
                        )}
                        {book.status === 'wishlist' && (
                          <span className="text-accent-600 text-sm font-medium">Want to Read</span>
                        )}
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookAdded={fetchBooks}
      />
    </div>
  );
};

export default BooksPage;