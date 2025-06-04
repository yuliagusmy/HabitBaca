import { motion } from 'framer-motion';
import { Award, BookOpen, BookText, Edit, LogOut, TrendingUp, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import BadgeDisplay from '../components/features/achievements/BadgeDisplay';
import BadgeGrid from '../components/features/achievements/BadgeGrid';
import UserLevel, { getLevelInfo } from '../components/features/UserLevel';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Badge } from '../types/supabase';

const ProfilePage: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooksRead: 0,
    totalPagesRead: 0,
    readingStreak: 0,
    favoriteGenre: '',
  });
  const [recentBadges, setRecentBadges] = useState<Badge[]>([]);
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const hasSyncedRef = useRef(false);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  useEffect(() => {
    if (user) {
      fetchProfileData();
      if (profile) {
        setUsername(profile.username);
      }
    }
  }, [user, profile]);

  useEffect(() => {
    // Sinkronisasi otomatis XP & halaman untuk buku completed
    if (!user || hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    const syncCompletedBooks = async () => {
      try {
        // 1. Ambil semua buku completed milik user
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('id, total_pages')
          .eq('user_id', user.id)
          .eq('status', 'completed');
        if (booksError) throw booksError;
        if (!books) return;

        // 2. Ambil semua reading_sessions milik user
        const { data: sessions, error: sessionsError } = await supabase
          .from('reading_sessions')
          .select('book_id')
          .eq('user_id', user.id);
        if (sessionsError) throw sessionsError;
        const sessionBookIds = new Set(sessions?.map(s => s.book_id));

        // 3. Filter buku completed yang belum ada reading session-nya
        const booksToSync = books.filter(book => !sessionBookIds.has(book.id));
        let didSync = false;
        if (booksToSync.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          for (const book of booksToSync) {
            await supabase.from('reading_sessions').insert({
              user_id: user.id,
              book_id: book.id,
              pages_read: book.total_pages,
              date: today
            });
          }
          didSync = true;
        }

        // 4. Ambil ulang total halaman dan total buku completed
        const { data: allSessions, error: allSessionsError } = await supabase
          .from('reading_sessions')
          .select('pages_read')
          .eq('user_id', user.id);
        if (allSessionsError) throw allSessionsError;
        const totalPagesRead = allSessions?.reduce((sum, s) => sum + (s.pages_read || 0), 0) || 0;
        const totalBooksCompleted = books.length;
        const newXP = totalPagesRead + (totalBooksCompleted * 50);

        // 5. Update XP & total_pages_read SELALU, meskipun tidak ada buku baru
        console.log('Update user_profiles:', {
          xp: newXP,
          total_pages_read: totalPagesRead,
          last_reading_date: new Date().toISOString().split('T')[0],
          user_id: user.id
        });
        const { error: updateError } = await supabase.from('user_profiles').update({
          xp: newXP,
          total_pages_read: totalPagesRead,
          last_reading_date: new Date().toISOString().split('T')[0]
        }).eq('user_id', user.id);
        if (updateError) {
          console.error('Failed to update XP:', updateError);
        }
        // 6. Delay sebelum refreshProfile
        await new Promise(res => setTimeout(res, 500));
        if (refreshProfile) await refreshProfile();
        // 7. Tampilkan toast hanya jika ada perubahan
        if (didSync) {
          toast.success('XP & halaman berhasil disinkronkan!');
        }
      } catch (err) {
        console.error('Error syncing completed books:', err);
      }
    };
    syncCompletedBooks();
  }, [user, refreshProfile]);

  const fetchProfileData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch stats
      const booksPromise = supabase
        .from('books')
        .select('genre')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const sessionsPromise = supabase
        .from('reading_sessions')
        .select('pages_read')
        .eq('user_id', user.id);

      const badgesPromise = supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(6);

      const [booksRes, sessionsRes, badgesRes] = await Promise.all([
        booksPromise,
        sessionsPromise,
        badgesPromise
      ]);

      if (booksRes.error) throw booksRes.error;
      if (sessionsRes.error) throw sessionsRes.error;
      if (badgesRes.error) throw badgesRes.error;

      // Calculate favorite genre
      const genreCounts: {[key: string]: number} = {};
      booksRes.data.forEach(book => {
        if (book.genre) {
          genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
        }
      });

      let favoriteGenre = 'None';
      let maxCount = 0;
      for (const [genre, count] of Object.entries(genreCounts)) {
        if (count > maxCount) {
          maxCount = count;
          favoriteGenre = genre;
        }
      }

      // Calculate total pages
      const totalPages = sessionsRes.data.reduce((sum, session) => sum + session.pages_read, 0);

      setStats({
        totalBooksRead: booksRes.data.length,
        totalPagesRead: totalPages,
        readingStreak: profile?.streak || 0,
        favoriteGenre
      });

      setRecentBadges(badgesRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ username })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Username updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTitle = (level: number) => {
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

  const levelInfo = profile ? getLevelInfo(profile.xp) : { level: 1 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-700 p-6 text-white">
          <div className="flex flex-row items-center gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-white text-primary-600 flex items-center justify-center text-3xl font-bold overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="h-full w-full object-cover rounded-full" />
              ) : (
                (username?.[0] || 'U').toUpperCase()
              )}
            </div>

            {/* User info */}
            <div className="flex-1 text-left">
              {isEditing ? (
                <div className="flex items-center mb-2 max-w-xs">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-3 py-2 bg-white bg-opacity-90 border border-transparent rounded-l-lg text-gray-800 focus:outline-none"
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    disabled={isLoading}
                    className="bg-primary-800 px-3 py-2 rounded-r-lg border-l border-primary-600"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <h2 className="text-2xl font-bold mb-1 flex items-center text-white">
                  {username}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
                  >
                    <Edit className="h-4 w-4 text-white" />
                  </button>
                </h2>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-white text-opacity-90 text-base">
                  {getUserTitle(levelInfo.level)}
                </span>
                {profile && profile.streak && profile.streak > 0 && (
                  <span className="flex items-center text-orange-300 text-sm">
                    <span className="mr-1">🔥</span> {profile.streak} day streak
                  </span>
                )}
              </div>

              {/* XP bar */}
              <div className="max-w-xs mb-2">
                <UserLevel profile={profile} />
              </div>
              <div className="text-white text-opacity-80 text-sm">Total XP: {profile?.xp || 0}</div>
            </div>
          </div>
        </div>

        {/* Stats overview */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <BookText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Books Read</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {isLoading ? '-' : stats.totalBooksRead}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Pages Read</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {isLoading ? '-' : stats.totalPagesRead.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-accent-100 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Favorite Genre</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {isLoading ? '-' : stats.favoriteGenre}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-success-100 p-2 rounded-full">
                  <Award className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Current Streak</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {isLoading ? '-' : `${stats.readingStreak} days`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Achievements</h3>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="loading-spinner"></div>
              </div>
            ) : recentBadges.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Award className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">You haven't earned any badges yet. Keep reading!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {recentBadges.map(badge => (
                  <BadgeDisplay key={badge.id} badge={badge} size="sm" />
                ))}
              </div>
            )}

            {recentBadges.length > 0 && (
              <div className="flex justify-center mt-4">
                <a
                  href="/achievements"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all achievements
                </a>
              </div>
            )}
          </div>

          {/* Account actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-700">Email</span>
                </div>
                <span className="text-gray-600">{user?.email}</span>
              </div>

              <button
                onClick={signOut}
                className="w-full px-4 py-3 text-left bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements/Badges */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><Award className="w-6 h-6 mr-2 text-yellow-500" />Achievements</h2>
        <BadgeGrid />
      </div>
    </motion.div>
  );
};

export default ProfilePage;