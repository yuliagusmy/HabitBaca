import { motion } from 'framer-motion';
import { ArrowRight, Award, Book, BookOpen, BookText } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section with gradient background */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700 flex-1 flex flex-col justify-center items-center text-white p-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <BookOpen className="h-20 w-20" />
          </motion.div>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            HabitBaca
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl mb-8 text-white/90"
          >
            Track, gamify, and level up your reading habits
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="loading-spinner border-primary-600"></div>
              ) : (
                <>
                  <span>Sign in with Google</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Build Your Reading Habit
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="card p-6 card-hover"
            >
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BookText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
              <p className="text-gray-600">
                Log daily reading sessions, track completion status, and visualize your journey with beautiful charts.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="card p-6 card-hover"
            >
              <div className="bg-secondary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Achievements</h3>
              <p className="text-gray-600">
                Unlock badges, level up your reader profile, and celebrate your reading milestones.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="card p-6 card-hover"
            >
              <div className="bg-accent-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Book className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Consistency</h3>
              <p className="text-gray-600">
                Maintain reading streaks, set personal goals, and transform reading into a daily habit.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;