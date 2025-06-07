import React, { useEffect, useState } from 'react';
import BadgeGrid from '../components/features/achievements/BadgeGrid';
import { ALL_BADGES } from '../constants/badges';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Badge, Book, UserProfile } from '../types/supabase';

const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [{ data: badgeData }, { data: bookData }, { data: profileData }] = await Promise.all([
          supabase.from('badges').select('*').eq('user_id', user.id),
          supabase.from('books').select('*').eq('user_id', user.id).eq('status', 'completed'),
          supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        ]);
        setBadges(badgeData || []);
        setBooks(bookData || []);
        setProfile(profileData || null);
      } catch (err) {
        setError('Gagal mengambil data achievements.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Hitung progressMap
  const progressMap: Record<string, { current: number; target: number }> = {};
  // Genre progress
  const genreCounts: Record<string, number> = {};
  books.forEach(book => {
    if (book.genre) {
      if (Array.isArray(book.genre)) {
        book.genre.forEach((g: string) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      } else {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
      }
    }
  });
  ALL_BADGES.filter(b => b.badge_type === 'genre').forEach(badge => {
    const genre = badge.badge_name.split(' ')[0];
    progressMap[badge.id] = {
      current: genreCounts[genre] || 0,
      target: badge.target,
    };
  });
  // Milestone progress (jumlah buku)
  const totalBooks = books.length;
  ALL_BADGES.filter(b => b.badge_type === 'milestone').forEach(badge => {
    progressMap[badge.id] = {
      current: totalBooks,
      target: badge.target,
    };
  });
  // Streak progress
  const streak = profile?.streak || 0;
  ALL_BADGES.filter(b => b.badge_type === 'streak').forEach(badge => {
    progressMap[badge.id] = {
      current: streak,
      target: badge.target,
    };
  });

  // Statistik
  const unlockedCount = badges.length;
  const totalBadgeCount = ALL_BADGES.length;
  const totalXP = badges.reduce((sum, b) => {
    const master = ALL_BADGES.find(mb => mb.badge_name === b.badge_name && mb.badge_type === b.badge_type);
    return sum + (master?.reward_xp || 0);
  }, 0);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Achievements</h1>
      <div className="mb-6 flex flex-wrap gap-6">
        <div className="bg-primary-50 rounded-lg px-4 py-2 font-semibold text-primary-700">Unlocked: {unlockedCount} / {totalBadgeCount}</div>
        <div className="bg-yellow-50 rounded-lg px-4 py-2 font-semibold text-yellow-700">Total XP: {totalXP}</div>
      </div>
      <BadgeGrid badges={badges} allBadges={ALL_BADGES as any} progressMap={progressMap} />
    </div>
  );
};

export default AchievementsPage;