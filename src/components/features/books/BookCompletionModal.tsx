import { AnimatePresence, motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import { BookOpen, Star, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Badge } from '../../../types/supabase';
import { awardBadgesOnEvent } from '../../../utils/awardBadges';
import BadgeNotification from '../achievements/BadgeNotification';

interface BookCompletionModalProps {
  open: boolean;
  onClose: () => void;
  book: {
    id: string;
    coverUrl: string;
    title: string;
    author: string;
    totalPages: number;
    genre: string;
    finishedAt: string;
  };
  quote: string;
}

const BookCompletionModal: React.FC<BookCompletionModalProps> = ({ open, onClose, book, quote }) => {
  const { user } = useAuth();
  const shareRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  const handleShareDownload = async () => {
    if (!shareRef.current) return;
    setLoading(true);
    const dataUrl = await htmlToImage.toPng(shareRef.current);
    const link = document.createElement('a');
    link.download = `achievement-${book.title}.png`;
    link.href = dataUrl;
    link.click();
    setLoading(false);
  };

  const handleShareWhatsapp = async () => {
    if (!shareRef.current) return;
    setLoading(true);
    const dataUrl = await htmlToImage.toPng(shareRef.current);
    // WhatsApp web does not support direct image upload, so share as text with image link
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `achievement-${book.title}.png`, { type: blob.type });
    // Try to use Web Share API if available
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Aku baru saja menyelesaikan buku: ${book.title}`,
        text: `Yuk baca juga! #HabitBaca`
      });
    } else {
      // Fallback: open WhatsApp with text and image link
      const url = `https://wa.me/?text=${encodeURIComponent(
        `Aku baru saja menyelesaikan buku: ${book.title} oleh ${book.author} di HabitBaca!\n\n${quote}\n\n`)} `;
      window.open(url, '_blank');
    }
    setLoading(false);
  };

  const handleShareTwitter = async () => {
    if (!shareRef.current) return;
    setLoading(true);
    const dataUrl = await htmlToImage.toPng(shareRef.current);
    // Twitter web does not support direct image upload, so share as text with image link
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Aku baru saja menyelesaikan buku: ${book.title} oleh ${book.author} di HabitBaca!\n${quote}\n#HabitBaca`)} `;
    window.open(url, '_blank');
    setLoading(false);
  };

  const handleShareInstagram = async () => {
    if (!shareRef.current) return;
    setLoading(true);
    const dataUrl = await htmlToImage.toPng(shareRef.current);
    // Instagram web does not support direct image upload, so just download and instruct user
    const link = document.createElement('a');
    link.download = `achievement-${book.title}.png`;
    link.href = dataUrl;
    link.click();
    setTimeout(() => {
      alert('Gambar telah diunduh. Upload manual ke Instagram Story/Feed ya!');
    }, 500);
    setLoading(false);
  };

  const handleComplete = async () => {
    // Mark buku sebagai completed
    const { error: updateError } = await supabase
      .from('books')
      .update({ status: 'completed', current_page: book.totalPages })
      .eq('id', book.id);

    if (updateError) {
      console.error('Error completing book:', updateError);
      return;
    }

    // Cek & award badge baru
    if (user) {
      const badges = await awardBadgesOnEvent(user.id, 'book_completed', { book });
      if (badges.length > 0) {
        setNewBadges(badges);
      }
    }
  };

  // Animated stars SVG
  const Stars = () => (
    <>
      <Star className="absolute left-2 top-2 text-yellow-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 6px #facc15)' }} />
      <Star className="absolute right-4 top-4 text-yellow-300 animate-spin-slow" style={{ filter: 'drop-shadow(0 0 8px #fde68a)' }} />
      <Star className="absolute left-8 bottom-4 text-yellow-200 animate-bounce" style={{ filter: 'drop-shadow(0 0 8px #fef08a)' }} />
      <Star className="absolute right-8 bottom-2 text-yellow-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 6px #facc15)' }} />
    </>
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-primary-100/80 via-white/80 to-yellow-100/80 backdrop-blur-sm"
              onClick={onClose}
            />
            {/* Confetti */}
            <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={350} recycle={false} gravity={0.25} />
            {/* Modal */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 bg-white rounded-3xl shadow-2xl px-2 sm:px-6 py-8 flex flex-col items-center border-4 border-primary-200 max-w-sm sm:max-w-md md:max-w-lg w-full overflow-visible"
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
                title="Tutup"
              >
                <X className="w-7 h-7" />
              </button>
              <div className="relative w-full flex flex-col items-center mb-2">
                <Stars />
                <div ref={shareRef} className="flex flex-col items-center w-full">
                  <div className="mb-3">
                    <BookOpen className="w-10 h-10 md:w-14 md:h-14 text-primary-500 animate-bounce drop-shadow-lg" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-pink-500 to-yellow-400 mb-2 text-center tracking-wide drop-shadow animate-shine">
                    Congratulations!
                  </h2>
                  <div className="text-sm md:text-base text-primary-700 font-semibold mb-1 text-center">You've finished reading a book!</div>
                  <div className="text-xs md:text-sm text-gray-500 mb-4 text-center">Kamu baru saja menyelesaikan membaca buku berikut:</div>
                  <div className="w-full bg-primary-50 rounded-2xl p-3 md:p-5 mb-4 shadow flex flex-row items-center border border-primary-200 gap-3 md:gap-5 max-w-xs mx-auto">
                    {/* Cover kiri */}
                    <div className="w-20 h-28 md:w-28 md:h-40 rounded-xl overflow-hidden shadow border-2 border-primary-300 bg-gray-100 flex items-center justify-center relative flex-shrink-0">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="object-cover w-full h-full" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    {/* Detail kanan */}
                    <div className="flex-1 flex flex-col justify-center items-start w-full">
                      <div className="text-lg md:text-2xl font-bold text-primary-800 mb-1 break-words whitespace-normal leading-snug">
                        {book.title}
                      </div>
                      <div className="text-sm md:text-base text-primary-600 italic mb-2 break-words whitespace-normal">
                        by {book.author}
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-700 mb-2">
                        <span>📄 <b>{book.totalPages}</b> pages</span>
                        <span>🏷️ <b>{Array.isArray(book.genre) ? book.genre.join(', ') : book.genre}</b></span>
                        <span>📅 <b>{book.finishedAt}</b></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <BadgeNotification badges={newBadges} />
    </>
  );
};

export default BookCompletionModal;

// Tailwind custom animation
// .animate-shine {
//   background-size: 200% auto;
//   animation: shine 2s linear infinite;
// }
// @keyframes shine {
//   to {
//     background-position: 200% center;
//   }
// }