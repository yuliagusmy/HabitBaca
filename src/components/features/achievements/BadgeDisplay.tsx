import { Award } from 'lucide-react';
import React from 'react';
import { Badge } from '../../../types/supabase';

interface BadgeDisplayProps {
  badge: Badge;
  locked?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badge, locked }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 flex flex-col items-center border-2 border-primary-200 ${locked ? 'opacity-40 grayscale' : ''}`}>
      <Award className="w-12 h-12 text-primary-500 mb-2" />
      <h3 className="font-bold text-gray-900 text-center">{badge.badge_name}</h3>
      <p className="text-sm text-gray-600 text-center mt-1">{badge.badge_type}</p>
      <p className="text-xs text-gray-500 text-center mt-2">Unlocked: {new Date(badge.unlocked_at).toLocaleDateString()}</p>
      {locked && <span className="mt-2 text-xs text-gray-400">Locked</span>}
    </div>
  );
};

export default BadgeDisplay;