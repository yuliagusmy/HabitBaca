import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <motion.div
        animate={{ 
          rotate: [0, 0, 270, 270, 0],
          scale: [1, 1.1, 1.1, 1, 1]
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 0.5
        }}
      >
        <BookOpen className="w-16 h-16 text-primary-600" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-xl font-medium text-primary-700"
      >
        Loading...
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mt-4"
      ></motion.div>
    </div>
  );
};

export default LoadingScreen;