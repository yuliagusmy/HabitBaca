import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../../types/supabase';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  // Calculate progress percentage
  const progress = Math.round((book.current_page / book.total_pages) * 100);

  // Determine status icon
  const StatusIcon = () => {
    switch (book.status) {
      case 'reading':
        return <Clock className="h-4 w-4 text-primary-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  // Status badge text and color
  const getStatusBadge = () => {
    switch (book.status) {
      case 'reading':
        return <span className="badge-primary">Reading</span>;
      case 'completed':
        return <span className="badge-success">Completed</span>;
      case 'wishlist':
        return <span className="badge-secondary">Wishlist</span>;
      default:
        return null;
    }
  };

  // Default book cover color based on genre
  const getGenreColor = () => {
    const genres: {[key: string]: string} = {
      'Fantasy': 'from-blue-400 to-purple-500',
      'Romance': 'from-pink-400 to-red-500',
      'Mystery': 'from-indigo-400 to-blue-500',
      'Science Fiction': 'from-cyan-400 to-blue-500',
      'Non-fiction': 'from-gray-400 to-gray-600',
      'Self-help': 'from-green-400 to-teal-500',
      'Biography': 'from-yellow-400 to-orange-500',
      'History': 'from-amber-400 to-yellow-600',
      'Philosophy': 'from-purple-400 to-indigo-600',
      'Poetry': 'from-pink-400 to-purple-500',
    };

    return genres[book.genre] || 'from-gray-400 to-gray-600';
  };

  // Tambahkan mapping warna badge genre yang konsisten dengan GenreSelector
  const genreColors: { [key: string]: string } = {
    'Fantasy': 'bg-purple-200 text-purple-900 border border-purple-300',
    'Science Fiction': 'bg-blue-200 text-blue-900 border border-blue-300',
    'Mystery': 'bg-gray-200 text-gray-900 border border-gray-300',
    'Thriller': 'bg-red-200 text-red-900 border border-red-300',
    'Romance': 'bg-pink-200 text-pink-900 border border-pink-300',
    'Historical Fiction': 'bg-yellow-200 text-yellow-900 border border-yellow-300',
    'Non-fiction': 'bg-green-200 text-green-900 border border-green-300',
    'Biography': 'bg-indigo-200 text-indigo-900 border border-indigo-300',
    'Self-help': 'bg-teal-200 text-teal-900 border border-teal-300',
    'Business': 'bg-orange-200 text-orange-900 border border-orange-300',
    'Philosophy': 'bg-cyan-200 text-cyan-900 border border-cyan-300',
    'Science': 'bg-emerald-200 text-emerald-900 border border-emerald-300',
    'Poetry': 'bg-rose-200 text-rose-900 border border-rose-300',
    'Memoir': 'bg-violet-200 text-violet-900 border border-violet-300',
    'Travel': 'bg-sky-200 text-sky-900 border border-sky-300',
    'Religion': 'bg-amber-200 text-amber-900 border border-amber-300',
    'History': 'bg-stone-200 text-stone-900 border border-stone-300',
    'Psychology': 'bg-fuchsia-200 text-fuchsia-900 border border-fuchsia-300',
    'Cooking': 'bg-lime-200 text-lime-900 border border-lime-300',
    'Art': 'bg-rose-100 text-rose-900 border border-rose-200',
    'Other': 'bg-slate-200 text-slate-900 border border-slate-300'
  };

  return (
    <Link to={`/books/${book.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="card card-hover h-full"
      >
        <div className="flex flex-col h-full">
          {/* Book cover */}
          <div className={`h-63 rounded-t-xl flex items-center justify-center bg-gradient-to-br ${getGenreColor()}`}>
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-full w-full object-cover rounded-t-xl"
                style={{ aspectRatio: '2/3' }}
              />
            ) : (
              <BookOpen className="h-16 w-16 text-white" />
            )}
          </div>

          {/* Book details */}
          <div className="p-4 flex-grow">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-gray-900 line-clamp-1">{book.title}</h3>
              <StatusIcon />
            </div>

            <p className="text-sm text-gray-500 mb-2">{book.author}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {Array.isArray(book.genre)
                ? book.genre.map((g) => (
                    <span
                      key={g}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mr-1 mb-1 ${genreColors[g] || 'bg-gray-200 text-gray-900 border border-gray-300'}`}
                    >
                      <BookOpen className="h-3 w-3 mr-1 text-gray-400" />
                      {g}
                    </span>
                  ))
                : book.genre && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mr-1 mb-1 ${genreColors[book.genre] || 'bg-gray-200 text-gray-900 border border-gray-300'}`}>
                      <BookOpen className="h-3 w-3 mr-1 text-gray-400" />
                      {book.genre}
                    </span>
                  )}
              {getStatusBadge()}
            </div>

            {/* Progress bar for books being read */}
            {book.status === 'reading' && (
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{book.current_page} of {book.total_pages} pages</span>
                  <span>{progress}%</span>
                </div>
                <div className="xp-bar-container">
                  <div
                    className="xp-bar-progress"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Completion indicator for completed books */}
            {book.status === 'completed' && (
              <div className="mt-auto pt-2">
                <div className="flex items-center text-success-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Completed {book.total_pages} pages</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;