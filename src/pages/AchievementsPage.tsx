import React from 'react';
import { motion } from 'framer-motion';
import BadgeGrid from '../components/features/achievements/BadgeGrid';

const AchievementsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">Your Achievements</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <BadgeGrid />
      </div>
    </motion.div>
  );
};

export default AchievementsPage;