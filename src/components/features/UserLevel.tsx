import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { UserProfile } from '../../types/supabase';

interface UserLevelProps {
  profile: UserProfile | null;
  user?: User | null;
  variant?: 'sidebar' | 'profile';
  username?: string;
}

interface LevelXPInfo {
  level: number;
  title: string;
  currentXP: number;
  xpToNext: number;
  isCurrent?: boolean;
  isNext?: boolean;
}

const getAllLevelXPInfo = (totalXP: number) => {
  const levelThresholds = [
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
  let xpLeft = totalXP;
  let arr: LevelXPInfo[] = [];
  for (let i = 0; i < levelThresholds.length; i++) {
    const [startLevel, baseXP, increment] = levelThresholds[i];
    if (level < startLevel) break;
    xpForLevel = baseXP;
    xpIncrement = increment;
  }
  // Build all previous levels
  while (xpLeft >= xpToNext) {
    arr.push({
      level,
      title: getUserTitle(level),
      currentXP: xpToNext,
      xpToNext: xpToNext,
    });
    xpLeft -= xpToNext;
    xpUsed += xpToNext;
    level++;
    for (let i = 0; i < levelThresholds.length; i++) {
      const [startLevel, baseXP, increment] = levelThresholds[i];
      if (level >= startLevel) {
        xpForLevel = baseXP + (level - startLevel) * increment;
        xpIncrement = increment;
      }
    }
    xpToNext = xpForLevel;
  }
  // Current level
  arr.push({
    level,
    title: getUserTitle(level),
    currentXP: xpLeft,
    xpToNext: xpToNext,
    isCurrent: true,
  });
  // Next level (always 0 / xp needed for next level)
  let nextXP = xpToNext;
  for (let i = 0; i < levelThresholds.length; i++) {
    const [startLevel, baseXP, increment] = levelThresholds[i];
    if (level + 1 >= startLevel) {
      nextXP = baseXP + ((level + 1) - startLevel) * increment;
    }
  }
  arr.push({
    level: level + 1,
    title: getUserTitle(level + 1),
    currentXP: 0,
    xpToNext: nextXP,
    isNext: true,
  });
  return arr;
};

interface LevelHistoryProps {
  currentLevel: number;
  currentXP: number;
  xpToNext: number;
  totalXP: number;
  variant?: 'sidebar' | 'profile';
}

const LevelHistory: React.FC<LevelHistoryProps> = ({ currentLevel, currentXP, xpToNext, totalXP, variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use totalXP for correct XP breakdown
  const allLevels = getAllLevelXPInfo(totalXP);
  const previousLevels = allLevels.filter(l => l.level < currentLevel);
  const current = allLevels.find(l => l.level === currentLevel);
  const next = allLevels.find(l => l.level === currentLevel + 1);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 transition-colors ${
          variant === 'profile'
            ? 'text-white hover:text-gray-200'
            : 'text-primary-700 hover:text-primary-800'
        }`}
      >
        <span className="text-sm font-semibold">Level {currentLevel}</span>
        <span className={`text-xs ${variant === 'profile' ? 'text-gray-200' : 'text-primary-500'}`}>{getUserTitle(currentLevel)}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              {/* Previous levels scrollable */}
              <div className="max-h-32 overflow-y-auto mb-3 pr-1 space-y-1">
                {previousLevels.map(l => (
                  <div key={l.level} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow transition-all">
                    <span className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="inline-block w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold">{l.level}</span>
                      <span className="truncate max-w-[120px]" title={l.title}>{l.title}</span>
                    </span>
                    <span className="text-xs text-gray-700 font-mono">{l.currentXP} / {l.xpToNext} XP</span>
                  </div>
                ))}
              </div>
              {/* Current level */}
              {current && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-primary-100 to-primary-50 border-2 border-primary-400 shadow font-semibold mb-3">
                  <span className="flex items-center gap-2 text-primary-800">
                    <span className="inline-block w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shadow">{current.level}</span>
                    <span className="truncate max-w-[120px]" title={current.title}>{current.title}</span>
                  </span>
                  <span className="text-sm text-primary-700 font-bold font-mono">{current.currentXP} / {current.xpToNext} XP</span>
                </div>
              )}
              {/* Next level */}
              {next && (
                <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-white to-orange-50 border border-orange-200 hover:shadow transition-all">
                  <span className="flex items-center gap-2 text-xs text-orange-500">
                    <span className="inline-block w-5 h-5 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold">{next.level}</span>
                    <span className="truncate max-w-[120px]" title={next.title}>{next.title}</span>
                  </span>
                  <span className="text-xs text-orange-600 font-mono">{next.currentXP} / {next.xpToNext} XP</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Move getUserTitle to top-level so it can be used anywhere in this file
export const getUserTitle = (level: number) => {
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

// Re-export getLevelInfo for compatibility
export const getLevelInfo = (totalXP: number) => {
  const levelThresholds = [
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
  let xpLeft = totalXP;
  for (let i = 0; i < levelThresholds.length; i++) {
    const [startLevel, baseXP, increment] = levelThresholds[i];
    if (level < startLevel) break;
    xpForLevel = baseXP;
    xpIncrement = increment;
  }
  while (xpLeft >= xpToNext) {
    xpLeft -= xpToNext;
    xpUsed += xpToNext;
    level++;
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
    currentXP: xpLeft,
    xpToNext,
    xpUsed,
    totalXP,
  };
};

const UserLevel: React.FC<UserLevelProps> = ({ profile, user, variant = 'profile', username }) => {
  if (!profile) return null;

  // Calculate level and XP info
  const { level, currentXP, xpToNext } = getLevelInfo(profile.xp);
  const progressPercent = Math.min(100, Math.round((currentXP / xpToNext) * 100));

  if (variant === 'sidebar') {
    return (
      <div className="bg-white rounded-2xl shadow-md px-3 py-3 flex flex-row items-center w-full gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow flex-shrink-0">
          {user && user.user_metadata && user.user_metadata.picture ? (
            <img src={user.user_metadata.picture} alt={profile.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            (profile.username?.[0] || '?').toUpperCase()
          )}
        </div>
        {/* Info User */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="text-primary-900 font-bold text-base truncate leading-tight mb-1">{username}</div>
          <div className="flex flex-col items-start mb-1">
            <span className="text-primary-700 font-bold text-m leading-tight">Level {level}</span>
            <span
              className="text-xs text-primary-500 max-w-full truncate cursor-pointer mt-0.5"
              title={getUserTitle(level)}
            >
              {getUserTitle(level)}
            </span>
          </div>
          <div className="w-full max-w-[140px] mt-2">
            <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-orange-400 transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 font-semibold mt-0.5">
              <span>{currentXP} XP</span>
              <span>{xpToNext} XP</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 font-semibold mt-0.5 tracking-wide">
            Total XP: <span className="text-primary-700 font-bold">{profile.xp}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default (profile variant)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <LevelHistory currentLevel={level} currentXP={currentXP} xpToNext={xpToNext} totalXP={profile.xp} variant="profile" />
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