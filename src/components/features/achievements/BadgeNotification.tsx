import { AnimatePresence, motion } from 'framer-motion';
import { Award } from 'lucide-react';
import React, { useEffect } from 'react';
import { Badge } from '../../../types/supabase';

interface BadgeNotificationProps {
  badges: Badge[];
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badges }) => {
  const [visibleBadges, setVisibleBadges] = React.useState<Badge[]>([]);

  useEffect(() => {
    if (badges.length > 0) {
      setVisibleBadges(badges);
      const timer = setTimeout(() => {
        setVisibleBadges([]);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [badges]);

  if (visibleBadges.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {visibleBadges.map(badge => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 border-l-4 border-primary-500"
          >
            <Award className="w-8 h-8 text-primary-500" />
            <div>
              <h3 className="font-bold text-gray-900">New Badge Unlocked!</h3>
              <p className="text-sm text-gray-600">{badge.badge_name}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BadgeNotification;