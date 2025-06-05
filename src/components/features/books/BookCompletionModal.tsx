import { AnimatePresence, motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import { BookOpen, Loader2, Share2, Star, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Confetti from 'react-confetti';

interface BookCompletionModalProps {
  open: boolean;
  onClose: () => void;
  book: {
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
  const shareRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

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
            className="relative z-10 bg-white rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center border-4 border-primary-200 max-w-lg w-full overflow-visible"
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
                  <BookOpen className="w-14 h-14 text-primary-500 animate-bounce drop-shadow-lg" />
                </div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-pink-500 to-yellow-400 mb-2 text-center tracking-wide drop-shadow animate-shine">
                  Congratulations!
                </h2>
                <div className="text-base text-primary-700 font-semibold mb-1 text-center">You've finished reading a book!</div>
                <div className="text-sm text-gray-500 mb-4 text-center">Kamu baru saja menyelesaikan membaca buku berikut:</div>
                <div className="w-36 h-52 rounded-xl overflow-hidden shadow-lg mb-4 border-4 border-primary-300 bg-gray-100 flex items-center justify-center relative">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="object-cover w-full h-full" />
                  ) : (
                    <BookOpen className="w-16 h-16 text-gray-300" />
                  )}
                </div>
                <div className="w-full bg-primary-50 rounded-2xl p-5 mb-4 shadow flex flex-col items-center border border-primary-200">
                  <div className="text-2xl font-bold text-primary-800 text-center mb-1">{book.title}</div>
                  <div className="text-base text-primary-600 italic mb-2">by {book.author}</div>
                  <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-700 mb-2">
                    <span>📄 <b>{book.totalPages}</b> pages</span>
                    <span>🏷️ <b>{book.genre}</b></span>
                    <span>📅 <b>{book.finishedAt}</b></span>
                  </div>
                </div>
                <div className="relative w-full flex flex-col items-center mb-2">
                  <span className="text-4xl text-primary-200 absolute -left-4 -top-2 select-none">"</span>
                  <div className="text-lg text-pink-600 italic font-medium text-center px-4">{quote}</div>
                  <span className="text-4xl text-primary-200 absolute -right-4 -bottom-2 select-none">"</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6 justify-center w-full">
              <button
                onClick={handleShareDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold shadow hover:bg-primary-700 transition text-base"
                title="Download as Image"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                Download
              </button>
              <button
                onClick={handleShareWhatsapp}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-bold shadow hover:bg-green-600 transition text-base"
                title="Bagikan ke WhatsApp"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 6.318h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.455 4.436-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.896 6.994c-.003 5.456-4.438 9.891-9.898 9.891zm8.413-18.306A11.815 11.815 0 0012.05 0C5.495 0 .16 5.336.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.654a11.876 11.876 0 005.735 1.463h.005c6.554 0 11.889-5.336 11.892-11.893a11.822 11.822 0 00-3.473-8.463z"/></svg>
                WhatsApp
              </button>
              <button
                onClick={handleShareTwitter}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition text-base"
                title="Bagikan ke Twitter"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 00-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.888 2.01-.888 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z"/></svg>
                Twitter
              </button>
              <button
                onClick={handleShareInstagram}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white font-bold shadow hover:from-pink-600 hover:to-yellow-500 transition text-base"
                title="Bagikan ke Instagram"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.333 3.374C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.282.353 2.394 1.333 3.374.98.98 2.092 1.274 3.374 1.333C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.059 2.394-.353 3.374-1.333.98-.98 1.274-2.092 1.333-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.282-.353-2.394-1.333-3.374-.98-.98-2.092-1.274-3.374-1.333C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
                Instagram
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition text-base"
                title="Tutup"
                disabled={loading}
              >
                Tutup
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center w-full">Bagikan pencapaianmu ke teman-teman dan ajak mereka membaca juga di HabitBaca!</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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