import React from 'react';
import { Badge as BadgeType } from '../../../types/supabase';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface BadgeDisplayProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badge, size = 'md' }) => {
  // Size classes
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };
  
  // Badge tier colors
  const tierColors = {
    1: "from-amber-700 to-amber-500", // Bronze
    2: "from-gray-400 to-gray-300", // Silver
    3: "from-amber-400 to-yellow-300", // Gold
    4: "from-blue-300 to-gray-200", // Platinum
    5: "from-cyan-300 to-blue-200" // Diamond
  };
  
  // Badge tier names
  const tierNames = {
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Platinum",
    5: "Diamond"
  };
  
  // Badge types have different colors
  const getTypeColor = (type: string) => {
    const typeColors: {[key: string]: string} = {
      'genre': 'text-primary-600',
      'completion': 'text-success-600',
      'streak': 'text-orange-600',
      'milestone': 'text-accent-600',
      'reading': 'text-secondary-600',
      'explorer': 'text-indigo-600',
      'secret': 'text-purple-600',
      'event': 'text-pink-600'
    };
    
    return typeColors[type] || 'text-primary-600';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="badge-glow"
    >
      <div className="flex flex-col items-center">
        {/* Badge icon */}
        <div className={`relative rounded-full ${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br ${tierColors[badge.badge_tier as 1|2|3|4|5] || tierColors[1]}`}>
          <Award className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'} text-white`} />
          <div className="absolute inset-0 rounded-full border-2 border-white opacity-20"></div>
        </div>
        
        {/* Badge name */}
        <div className="mt-2 text-center">
          <p className={`font-medium ${getTypeColor(badge.badge_type)} ${size === 'sm' ? 'text-xs' : 'text-sm'} line-clamp-2`}>
            {badge.badge_name}
          </p>
          <p className="text-xs text-gray-500">
            {tierNames[badge.badge_tier as 1|2|3|4|5] || 'Bronze'}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(badge.unlocked_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BadgeDisplay;