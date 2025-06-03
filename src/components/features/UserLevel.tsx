import { motion } from 'framer-motion';
import React from 'react';
import { UserProfile } from '../../types/supabase';

interface UserLevelProps {
  profile: UserProfile | null;
}

const getLevelInfo = (totalXP: number) => {
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

const UserLevel: React.FC<UserLevelProps> = ({ profile }) => {
  if (!profile) return null;

  // Calculate level and XP info
  const { level, currentXP, xpToNext, totalXP } = getLevelInfo(profile.xp);
  const progressPercent = Math.min(100, Math.round((currentXP / xpToNext) * 100));

  // Determine user title based on level range
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

  const userTitle = getUserTitle(level);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{profile.username}</h3>
        <span className="text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-2 py-0.5">
          Lvl {level}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-1">{userTitle}</div>
      {/* XP bar */}
      <div className="xp-bar-container">
        <motion.div
          className="xp-bar-progress"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        ></motion.div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{currentXP} XP</span>
        <span>{xpToNext} XP</span>
      </div>
      <div className="text-xs text-gray-400 text-left">Total XP: {profile.xp}</div>
      {/* Streak indicator */}
      {profile.streak > 0 && (
        <div className="flex items-center text-xs text-orange-600 mt-1">
          <span className="mr-1">🔥</span>
          <span>{profile.streak} day streak</span>
        </div>
      )}
    </div>
  );
};

export default UserLevel;