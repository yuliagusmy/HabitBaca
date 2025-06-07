import { Award } from 'lucide-react';
import React, { useState } from 'react';
import { ALL_BADGES } from '../../../constants/badges';
import { Badge } from '../../../types/supabase';

interface BadgeDisplayProps {
  badge: Badge;
  locked?: boolean;
  progress?: { current: number; target: number };
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badge, locked, progress }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  // Cari master badge untuk info detail
  const master = ALL_BADGES.find(mb => mb.badge_name === badge.badge_name && mb.badge_type === badge.badge_type);

  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-4 flex flex-col items-center border-2 border-primary-200 relative ${locked ? 'opacity-40 grayscale' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(v => !v)}
    >
      <Award className="w-12 h-12 text-primary-500 mb-2" />
      <h3 className="font-bold text-gray-900 text-center">{badge.badge_name}</h3>
      <p className="text-sm text-gray-600 text-center mt-1">{badge.badge_type}</p>
      <p className="text-xs text-gray-500 text-center mt-2">Unlocked: {new Date(badge.unlocked_at).toLocaleDateString()}</p>
      {locked && <span className="mt-2 text-xs text-gray-400">Locked</span>}
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-sm text-gray-800 animate-fade-in">
          <div className="font-bold text-primary-700 mb-1">{badge.badge_name}</div>
          {master?.description && <div className="mb-1">{master.description}</div>}
          {typeof master?.reward_xp === 'number' && (
            <div className="mb-1">XP Reward: <span className="font-semibold text-yellow-600">+{master.reward_xp} XP</span></div>
          )}
          {progress && (
            <div className="mb-1">Progress: <span className="font-semibold">{progress.current} / {progress.target}</span></div>
          )}
          {!locked && (
            <div className="text-xs text-gray-500">Unlocked: {new Date(badge.unlocked_at).toLocaleDateString()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;