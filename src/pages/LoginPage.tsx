import { motion } from 'framer-motion';
import { Award, Book, BookText } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Google SVG icon
const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.77-5.62C34.5 3.7 29.74 1.5 24 1.5 14.98 1.5 7.09 7.5 3.67 15.09l6.91 5.36C12.36 14.09 17.68 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.04h12.4c-.54 2.9-2.18 5.36-4.65 7.04l7.18 5.59C43.91 37.09 46.1 31.27 46.1 24.5z"/><path fill="#FBBC05" d="M10.58 28.45c-1.01-2.99-1.01-6.21 0-9.2l-6.91-5.36C1.1 17.09 0 20.41 0 24c0 3.59 1.1 6.91 3.67 10.11l6.91-5.36z"/><path fill="#EA4335" d="M24 46.5c5.74 0 10.5-1.9 14.01-5.18l-7.18-5.59c-1.98 1.33-4.52 2.12-6.83 2.12-6.32 0-11.64-4.59-13.42-10.77l-6.91 5.36C7.09 40.5 14.98 46.5 24 46.5z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
);

// Ilustrasi SVG custom (rak buku/karakter membaca)
const ReadingHeroSVG = () => (
  <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="60" width="100" height="10" rx="2" fill="#E0E7FF" />
    <rect x="20" y="50" width="20" height="10" rx="2" fill="#A5B4FC" />
    <rect x="45" y="45" width="15" height="15" rx="2" fill="#FDE68A" />
    <rect x="65" y="50" width="25" height="10" rx="2" fill="#FCA5A5" />
    <rect x="95" y="40" width="10" height="20" rx="2" fill="#6EE7B7" />
    <ellipse cx="60" cy="80" rx="50" ry="7" fill="#C7D2FE" fillOpacity="0.5" />
    <circle cx="60" cy="35" r="12" fill="#6366F1" />
    <rect x="54" y="30" width="12" height="10" rx="2" fill="#fff" />
    <rect x="57" y="33" width="6" height="4" rx="1" fill="#FBBF24" />
  </svg>
);

const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="md:h-screen flex flex-col-reverse md:flex-row overflow-y-auto">
      {/* Kiri: Fitur */}
      <div className="flex-1 bg-white flex flex-col items-center px-2 py-6 md:py-0 overflow-y-auto pb-8">
        <div className="w-full max-w-lg md:max-w-2xl flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-4 md:mt-7 text-gray-900">Build Your Reading Habit</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:gap-x-6 md:gap-y-8 w-full items-stretch md:items-stretch justify-center">
            <motion.div whileHover={{ y: -3 }} className="card p-4 md:p-6 card-hover flex flex-col justify-center items-center text-center h-full w-full">
              <div className="bg-primary-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                <BookText className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-base md:text-xl font-semibold mb-1">Track Your Progress</h3>
              <p className="text-gray-600 text-sm md:text-base text-center">Log daily reading sessions, track completion status, and visualize your journey with beautiful charts.</p>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} className="card p-4 md:p-8 card-hover flex flex-col justify-center items-center text-center h-full w-full">
              <div className="bg-secondary-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-secondary-600" />
              </div>
              <h3 className="text-base md:text-xl font-semibold mb-1">Earn Achievements</h3>
              <p className="text-gray-600 text-sm md:text-base text-center">Unlock badges, level up your reader profile, and celebrate your reading milestones.</p>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} className="card p-4 md:p-8 card-hover flex flex-col justify-center items-center text-center h-full w-full">
              <div className="bg-accent-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                <Book className="h-5 w-5 text-accent-600" />
              </div>
              <h3 className="text-base md:text-xl font-semibold mb-1">Build Consistency</h3>
              <p className="text-gray-600 text-sm md:text-base text-center">Maintain reading streaks, set personal goals, and transform reading into a daily habit.</p>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} className="card p-4 md:p-8 card-hover flex flex-col justify-center items-center text-center h-full w-full">
              <div className="bg-success-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                <svg className="h-5 w-5 text-success-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
              </div>
              <h3 className="text-base md:text-xl font-semibold mb-1">Personalized Goals</h3>
              <p className="text-gray-600 text-sm md:text-base text-center">Set your own reading goals and get personalized suggestions to keep you motivated.</p>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Kanan: Login */}
      <div className="flex-1 relative flex flex-col justify-center items-center text-white p-6 overflow-hidden bg-primary-800 h-full">
        {/* Pattern SVG background */}
        <svg className="absolute left-0 top-0 w-full h-full opacity-20 pointer-events-none" width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg-grad" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(45)">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="400" fill="url(#bg-grad)" />
          <circle cx="320" cy="80" r="60" fill="#818cf8" fillOpacity="0.12" />
          <circle cx="80" cy="320" r="40" fill="#fbbf24" fillOpacity="0.10" />
        </svg>
        <div className="w-full max-w-xs md:max-w-md mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-700 border-2 border-primary-200/30 bg-clip-padding rounded-3xl shadow-2xl px-4 py-6 md:p-10 flex flex-col items-center text-center relative overflow-hidden"
            style={{ boxShadow: '0 8px 32px 0 rgba(109, 40, 217, 0.25)' }}
          >
            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none border-4 border-primary-400/30" style={{zIndex:0}} />
            {/* Ilustrasi custom animasi */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="z-10 mb-2"
            >
              <ReadingHeroSVG />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow z-10">HabitBaca</h1>
            <p className="text-sm md:text-lg mb-2 text-white/90 font-medium z-10">Aplikasi pelacak kebiasaan membaca yang seru dan memotivasi!</p>
            <p className="text-xs md:text-base mb-6 text-white/80 z-10">Gabung dan mulai perjalanan membaca kamu hari ini 🚀</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-white text-primary-700 text-base md:text-lg font-semibold rounded-xl py-3 px-4 md:px-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 z-10 mb-4"
            >
              {isLoading ? (
                <div className="loading-spinner border-primary-600"></div>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </>
              )}
            </motion.button>
            <div className="mt-2 text-white/90 italic text-center text-xs md:text-sm z-10">
              "Membaca adalah jendela dunia. Satu buku, sejuta inspirasi."
            </div>
            <div className="mt-6 text-xs text-white/60 text-center z-10">
              &copy; {new Date().getFullYear()} HabitBaca
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;