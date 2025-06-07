import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { genreColors } from '../../../constants/genreColors';
import { Book } from '../../../types/supabase';

interface BookCardProps {
  book: Book;
  size?: 'large' | 'medium' | 'small';
}

const BookCard: React.FC<BookCardProps> = ({ book, size = 'large' }) => {
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
  const getGenreCoverColor = (genre: string | string[]) => {
    const primaryGenre = Array.isArray(genre) ? genre[0] : genre;
    switch (primaryGenre) {
      case 'Fantasi': return 'from-blue-400 to-purple-500';
      case 'Romance': return 'from-pink-400 to-red-500';
      case 'Mystery': return 'from-indigo-400 to-blue-500';
      case 'Science Fiction': return 'from-cyan-400 to-blue-500';
      case 'Non-fiction': return 'from-gray-400 to-gray-600';
      case 'Self-help': return 'from-green-400 to-teal-500';
      case 'Biography': return 'from-yellow-400 to-orange-500';
      case 'History': return 'from-amber-400 to-yellow-600';
      case 'Philosophy': return 'from-purple-400 to-indigo-600';
      case 'Poetry': return 'from-pink-400 to-purple-500';
      // Tambahkan lebih banyak mapping warna cover jika diperlukan
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Ukuran dinamis
  const coverSize = 'aspect-[2/3] w-full';
  const padding = size === 'large' ? 'p-4' : size === 'medium' ? 'p-2' : 'p-1';
  const titleClass = size === 'large' ? 'text-base' : size === 'medium' ? 'text-sm' : 'text-xs';
  const authorClass = size === 'large' ? 'text-sm' : size === 'medium' ? 'text-xs' : 'text-[10px]';
  // showDetails hanya untuk large
  const showDetailsLarge = size === 'large';

  return (
    <Link to={`/books/${book.id}`} title={book.title}>
      <motion.div
        whileHover={{ y: -3 }}
        className={`card card-hover h-full ${size === 'small' ? 'min-w-0' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Book cover */}
          <div className={`${coverSize} rounded-t-xl flex items-center justify-center bg-gradient-to-br ${getGenreCoverColor(book.genre)}`}>
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover rounded-t-xl"
                style={{ aspectRatio: '2/3' }}
              />
            ) : (
              <BookOpen className={size === 'small' ? 'h-8 w-8 text-white' : size === 'medium' ? 'h-12 w-12 text-white' : 'h-16 w-16 text-white'} />
            )}
          </div>

          {/* Book details for large size */}
          {showDetailsLarge && (
            <div className={`flex flex-col flex-1 ${padding}`}>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-medium text-gray-900 line-clamp-1 ${titleClass}`}>{book.title}</h3>
                  <StatusIcon />
                </div>
                <p className={`text-gray-500 mb-2 ${authorClass}`}>{book.author}</p>
                <div className={`flex flex-wrap gap-1 mb-2`}>
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
              </div>

              {/* Progress bar and pages for large books being read */}
              {book.status === 'reading' && progress > 0 && (
                <div className="pt-2 mt-auto">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{book.current_page} of {book.total_pages} pages</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Book details for medium size */}
          {size === 'medium' && (
            <div className="flex flex-col flex-1 p-2">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">{book.title}</h3>
              <p className="text-xs text-gray-500 mb-1 line-clamp-1">{book.author}</p>
              <div className="flex flex-wrap gap-1 mb-1">
                {getStatusBadge()}
              </div>
            </div>
          )}

          {/* Book details for small size */}
          {size === 'small' && (
            <div className="px-1 py-1 text-center">
              <h3 className="text-xs font-medium text-gray-900 truncate" title={book.title}>{book.title}</h3>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;