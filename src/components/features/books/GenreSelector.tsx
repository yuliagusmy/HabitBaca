import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ALL_BADGES } from '../../../constants/badges';
import { genreColors } from '../../../constants/genreColors';

interface GenreSelectorProps {
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
  className?: string;
}

const genreOptions = Array.from(new Set(
  ALL_BADGES.filter(b => b.badge_type === 'genre')
    .map(b => b.badge_name.split(' ')[0])
)).sort();

const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedGenres, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredGenres = genreOptions.filter(genre =>
    genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      onChange([...selectedGenres, genre]);
    }
    setSearchTerm('');
  };

  const handleRemove = (genre: string) => {
    onChange(selectedGenres.filter(g => g !== genre));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="min-h-[42px] p-2 border border-gray-300 rounded-lg bg-white">
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selectedGenres.map(genre => (
              <motion.div
                key={genre}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${genreColors[genre] || 'bg-gray-200 text-gray-900 border border-gray-300'}`}
              >
                {genre}
                <button
                  onClick={() => handleRemove(genre)}
                  className="ml-1 hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedGenres.length === 0 ? "Select genres..." : ""}
            className="flex-1 min-w-[120px] outline-none text-sm"
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredGenres.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">No genres found</div>
            ) : (
              <div className="p-1">
                {filteredGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleSelect(genre)}
                    disabled={selectedGenres.includes(genre)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 ${
                      selectedGenres.includes(genre) ? 'bg-gray-50' : ''
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenreSelector;