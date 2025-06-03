import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../../types/supabase';
import BadgeDisplay from './BadgeDisplay';
import { Award } from 'lucide-react';

const BadgeGrid: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
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

  useEffect(() => {
    if (user) {
      fetchBadges();
    }
  }, [user, filter]);

  const fetchBadges = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      
      // Apply type filter
      if (filter !== 'all') {
        query = query.eq('badge_type', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : badges.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {badges.map(badge => (
            <BadgeDisplay key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeGrid;