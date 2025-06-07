import React, { useEffect, useState } from 'react';
import BadgeGrid from '../components/features/achievements/BadgeGrid';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Badge } from '../types/supabase';

const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        setError('Gagal mengambil data badge.');
        setBadges([]);
      } else {
        setBadges(data || []);
      }
      setLoading(false);
    };
    fetchBadges();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Achievements</h1>
      <BadgeGrid badges={badges} />
    </div>
  );
};

export default AchievementsPage;