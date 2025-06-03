import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, BookOpen } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onBookAdded }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    total_pages: 100,
    status: 'wishlist',
    cover_url: ''
  });

  // Predefined genre options
  const genreOptions = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Thriller',
    'Romance', 'Historical Fiction', 'Non-fiction', 'Biography',
    'Self-help', 'Business', 'Philosophy', 'Science',
    'Poetry', 'Memoir', 'Travel', 'Religion',
    'History', 'Psychology', 'Cooking', 'Art',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'total_pages') {
      setFormData({
        ...formData,
        [name]: Math.max(1, parseInt(value) || 1)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Prepare book data
      const bookData = {
        ...formData,
        user_id: user.id,
        current_page: formData.status === 'completed' ? formData.total_pages : 0,
      };
      
      // Insert book
      const { data, error } = await supabase
        .from('books')
        .insert(bookData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Book added successfully!');
      onBookAdded();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        genre: '',
        total_pages: 100,
        status: 'wishlist',
        cover_url: ''
      });
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
                <Plus className="mr-2 h-5 w-5" />
                Add New Book
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
            
            <div className="space-y-4">
              {/* Book title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              
              {/* Author */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author*
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              
              {/* Genre */}
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                  Genre*
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="" disabled>Select a genre</option>
                  {genreOptions.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              {/* Total Pages */}
              <div>
                <label htmlFor="total_pages" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Pages*
                </label>
                <input
                  type="number"
                  id="total_pages"
                  name="total_pages"
                  value={formData.total_pages}
                  onChange={handleChange}
                  min="1"
                  className="input-field"
                  required
                />
              </div>
              
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Status*
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="wishlist">Wishlist (Want to Read)</option>
                  <option value="reading">Currently Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Cover URL - Optional */}
              <div>
                <label htmlFor="cover_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Cover URL (Optional)
                </label>
                <input
                  type="text"
                  id="cover_url"
                  name="cover_url"
                  value={formData.cover_url}
                  onChange={handleChange}
                  placeholder="https://example.com/book-cover.jpg"
                  className="input-field"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a URL for the book cover image (optional).
                </p>
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2 w-4 h-4 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Add Book'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBookModal;