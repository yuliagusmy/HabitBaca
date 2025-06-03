import React from 'react';
import { motion } from 'framer-motion';
import ReadingStats from '../components/features/stats/ReadingStats';

const StatsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reading Statistics</h1>
      
      <ReadingStats />
    </motion.div>
  );
};

export default StatsPage;