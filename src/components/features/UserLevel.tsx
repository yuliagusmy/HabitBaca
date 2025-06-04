import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import React from 'react';
import { UserProfile } from '../../types/supabase';

interface UserLevelProps {
  profile: UserProfile | null;
  user?: User | null;
  variant?: 'sidebar' | 'profile';
  username?: string;
}

export const getLevelInfo = (totalXP: number) => {
  // Leveling rules from user
  const levelThresholds = [
    // [level, xp needed for this level, xp increment]
    [1, 100, 20],
    [6, 200, 20],
    [11, 280, 30],
    [16, 400, 40],
    [21, 600, 50],
    [31, 800, 60],
    [41, 1100, 70],
    [51, 1500, 100],
    [71, 2000, 150],
    [91, 2500, 200],
  ];
  let level = 1;
  let xpForLevel = 100;
  let xpIncrement = 20;
  let xpToNext = xpForLevel;
  let xpUsed = 0;
  for (let i = 0; i < levelThresholds.length; i++) {
    const [startLevel, baseXP, increment] = levelThresholds[i];
    if (level < startLevel) break;
    xpForLevel = baseXP;
    xpIncrement = increment;
  }
  while (totalXP >= xpToNext) {
    totalXP -= xpToNext;
    xpUsed += xpToNext;
    level++;
    // Update xpForLevel and increment if level crosses threshold
    for (let i = 0; i < levelThresholds.length; i++) {
      const [startLevel, baseXP, increment] = levelThresholds[i];
      if (level >= startLevel) {
        xpForLevel = baseXP + (level - startLevel) * increment;
        xpIncrement = increment;
      }
    }
    xpToNext = xpForLevel;
  }
  return {
    level,
    currentXP: totalXP,
    xpToNext,
    xpUsed,
    totalXP: xpUsed + totalXP,
  };
};

const UserLevel: React.FC<UserLevelProps> = ({ profile, user, variant = 'profile', username }) => {
  if (!profile) return null;

  // Calculate level and XP info
  const { level, currentXP, xpToNext } = getLevelInfo(profile.xp);
  const progressPercent = Math.min(100, Math.round((currentXP / xpToNext) * 100));

  // User title for sidebar
  const getUserTitle = (level: number) => {
    if (level <= 5) return 'Pustakawan Pemula';
    if (level <= 10) return 'Penjelajah Halaman';
    if (level <= 15) return 'Penggali Ilmu';
    if (level <= 20) return 'Pencinta Buku Sejati';
    if (level <= 30) return 'Ahli Literasi';
    if (level <= 40) return 'Pemburu Cerita';
    if (level <= 50) return 'Cendekiawan';
    if (level <= 70) return 'Sang Guru Bacaan';
    if (level <= 90) return 'Penjaga Warisan Kata';
    return 'Legenda Literasi';
  };

  if (variant === 'sidebar') {
    return (
      <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex flex-col items-center space-y-2">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow mb-1">
          {user && user.user_metadata && user.user_metadata.picture ? (
            <img src={user.user_metadata.picture} alt={profile.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            (profile.username?.[0] || '?').toUpperCase()
          )}
        </div>
        {/* Username */}
        <div className="text-primary-900 font-semibold text-base truncate">{username}</div>
        {/* Level badge */}
        <span className="text-xs font-bold text-primary-700 bg-primary-50 rounded-full px-3 py-0.5">
          Lvl {level}
        </span>
        {/* Title */}
        <div className="text-sm font-bold text-primary-800 mt-1 mb-1">{getUserTitle(level)}</div>
        {/* XP Bar */}
        <div className="w-full">
          <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-primary-400 to-orange-400 transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-semibold mt-1">
            <span>{currentXP} XP</span>
            <span>{xpToNext} XP</span>
          </div>
        </div>
      </div>
    );
  }

  // Default (profile variant)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-2 py-0.5">
          Lvl {level}
        </span>
      </div>
      {/* XP bar */}
      <div className="xp-bar-container mb-1">
        <motion.div
          className="xp-bar-progress"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        ></motion.div>
      </div>
      <div className="flex justify-between text-xs text-gray-200">
        <span>{currentXP} XP</span>
        <span>{xpToNext} XP</span>
      </div>
    </div>
  );
};

export default UserLevel;