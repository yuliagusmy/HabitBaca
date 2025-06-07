import { Award } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../../../types/supabase';
import BadgeDisplay from './BadgeDisplay';

interface BadgeGridProps {
  badges?: Badge[];
  allBadges?: Badge[]; // Daftar semua badge (unlocked + locked)
  progressMap?: Record<string, { current: number; target: number }>; // Untuk progress bar
  highlightIds?: string[]; // Untuk animasi unlock
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges = [], allBadges = [], progressMap = {}, highlightIds = [] }) => {
  const [filter, setFilter] = useState<string>('all');

  // Gabungkan unlocked dan locked badge
  const unlockedIds = new Set(badges.map(b => b.id));
  const displayBadges = allBadges.length > 0 ? allBadges : badges;

  // Badge type options
  const badgeTypeOptions = [
    { value: 'all', label: 'All Badges' },
    { value: 'genre', label: 'Genre Badges' },
    { value: 'completion', label: 'Completion' },
    { value: 'streak', label: 'Streaks' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'reading', label: 'Reading Style' },
    { value: 'explorer', label: 'Explorer' },
    { value: 'secret', label: 'Secret' },
    { value: 'event', label: 'Events' }
  ];

  const filteredBadges = filter === 'all'
    ? displayBadges
    : displayBadges.filter(badge => badge.badge_type === filter);

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No Badges Yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Continue reading and completing challenges to earn badges!
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex flex-wrap gap-2">
        {badgeTypeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              filter === option.value
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      {filteredBadges.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBadges.map(badge => {
            const unlocked = unlockedIds.has(badge.id);
            const progress = progressMap[badge.id];
            const highlight = highlightIds.includes(badge.id);
            return (
              <div key={badge.id} className={highlight ? 'animate-glow-badge' : ''}>
                <BadgeDisplay badge={badge} locked={!unlocked} progress={progress} />
                {progress && (
                  <div className="mt-2 w-full">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {progress.current} / {progress.target}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BadgeGrid;