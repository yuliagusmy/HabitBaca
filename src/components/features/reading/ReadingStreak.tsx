import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Badge } from '../../../types/supabase';
import { awardBadgesOnEvent } from '../../../utils/awardBadges';
import BadgeNotification from '../achievements/BadgeNotification';

const ReadingStreak: React.FC = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  const fetchStreak = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('streak')
      .eq('user_id', user.id)
      .single();
    if (error) {
      console.error('Error fetching streak:', error);
    } else {
      setStreak(data.streak);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  const updateStreak = async () => {
    if (!user) return;

    try {
      // Update streak di profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ streak: streak + 1, last_reading_date: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      // Cek & award badge baru
      const badges = await awardBadgesOnEvent(user.id, 'streak_updated', { streak: streak + 1 });
      if (badges.length > 0) {
        setNewBadges(badges);
      }

      // Refresh data
      fetchStreak();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return (
    <>
      <div>
        <h2>Reading Streak: {streak} days</h2>
        <button onClick={updateStreak}>Update Streak</button>
      </div>
      <BadgeNotification badges={newBadges} />
    </>
  );
};

export default ReadingStreak;