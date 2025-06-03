import React from 'react';
import { Book } from '../../../types/supabase';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  return (
    <Link to={`/books/${book.id}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="card card-hover h-full"
      >
        <div className="flex flex-col h-full">
          {/* Book cover */}
          <div className={`h-36 rounded-t-xl flex items-center justify-center bg-gradient-to-br ${getGenreColor()}`}>
            {book.cover_url ? (
              <img 
                src={book.cover_url} 
                alt={book.title}
                className="h-full w-full object-cover rounded-t-xl"
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
              <span className="badge-secondary">{book.genre}</span>
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