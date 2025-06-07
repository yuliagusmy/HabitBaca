import { supabase } from '../lib/supabase';
import { Badge, Book, ReadingSession, UserProfile } from '../types/supabase';

// Tipe untuk badge progress (progress bar di achievements)
export interface BadgeProgress {
  badge_type: string;
  badge_tier: number;
  badge_name: string;
  unlocked: boolean;
  progress: number; // 0-1
  current: number; // jumlah progress saat ini
  target: number; // target untuk unlock
  reward_xp: number;
  unlocked_at?: string;
  description?: string;
}

// Fungsi utama: awardBadges
export async function awardBadges(userId: string, options: {
  books?: Book[];
  sessions?: ReadingSession[];
  profile?: UserProfile;
  eventType?: string;
  eventData?: any;
}): Promise<Badge[]> {
  // 1. Ambil badge yang sudah didapat user
  const { data: badges, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;

  // 2. Cek badge genre
  let newBadges: Badge[] = [];
  if (options.books) {
    const genreBadges = await checkGenreBadges(userId, options.books);
    newBadges = [...newBadges, ...genreBadges];
  }

  // 3. Cek badge milestone jumlah buku
  const bookBadges = await checkBookCountBadges(userId, options.books || []);
  newBadges = [...newBadges, ...bookBadges];

  // 4. Cek badge milestone halaman
  const pageBadges = await checkPageCountBadges(userId, options.books || []);
  newBadges = [...newBadges, ...pageBadges];

  // 5. Cek badge streak
  if (options.profile) {
    const streakBadges = await checkStreakBadges(userId, options.profile);
    newBadges = [...newBadges, ...streakBadges];
  }

  // 6. Cek badge gaya membaca, dsb
  if (options.sessions) {
    const readingBadges = await checkReadingStyleBadges(userId, options.sessions);
    newBadges = [...newBadges, ...readingBadges];
  }

  // 7. Return badge baru yang didapat
  return newBadges;
}

// Implementasi detail logic badge genre
export async function checkGenreBadges(userId: string, books: Book[]): Promise<Badge[]> {
  // 1. Hitung jumlah buku per genre
  const genreCounts: Record<string, number> = {};
  books.forEach(book => {
    if (book.genre) {
      genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
    }
  });

  // 2. Cek syarat badge genre (misal: 5 buku per genre)
  const genreBadges: Badge[] = [];
  for (const [genre, count] of Object.entries(genreCounts)) {
    if (count >= 5) {
      // 3. Cek apakah badge sudah pernah didapat
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_type', 'genre')
        .eq('badge_name', genre)
        .single();

      if (!existingBadge) {
        // 4. Insert badge baru
        const { data: newBadge, error } = await supabase
          .from('badges')
          .insert({
            user_id: userId,
            badge_type: 'genre',
            badge_name: genre,
            badge_tier: 1,
            reward_xp: 100,
            unlocked_at: new Date().toISOString(),
            description: `Membaca 5 buku genre ${genre}`
          })
          .select()
          .single();

        if (error) throw error;
        if (newBadge) genreBadges.push(newBadge);
      }
    }
  }

  return genreBadges;
}

// Implementasi detail logic badge milestone jumlah buku
export async function checkBookCountBadges(userId: string, books: Book[]): Promise<Badge[]> {
  const totalBooks = books.length;
  const milestones = [10, 50, 100]; // Milestone jumlah buku
  const bookBadges: Badge[] = [];

  for (const milestone of milestones) {
    if (totalBooks >= milestone) {
      // Cek apakah badge sudah pernah didapat
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_type', 'milestone')
        .eq('badge_name', `book_${milestone}`)
        .single();

      if (!existingBadge) {
        // Insert badge baru
        const { data: newBadge, error } = await supabase
          .from('badges')
          .insert({
            user_id: userId,
            badge_type: 'milestone',
            badge_name: `book_${milestone}`,
            badge_tier: 1,
            reward_xp: milestone * 10, // XP reward sesuai milestone
            unlocked_at: new Date().toISOString(),
            description: `Membaca ${milestone} buku`
          })
          .select()
          .single();

        if (error) throw error;
        if (newBadge) bookBadges.push(newBadge);
      }
    }
  }

  return bookBadges;
}

// Implementasi detail logic badge milestone halaman
export async function checkPageCountBadges(userId: string, books: Book[]): Promise<Badge[]> {
  const totalPages = books.reduce((sum, book) => sum + (book.total_pages || 0), 0);
  const milestones = [1000, 5000, 10000]; // Milestone jumlah halaman
  const pageBadges: Badge[] = [];

  for (const milestone of milestones) {
    if (totalPages >= milestone) {
      // Cek apakah badge sudah pernah didapat
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_type', 'milestone')
        .eq('badge_name', `page_${milestone}`)
        .single();

      if (!existingBadge) {
        // Insert badge baru
        const { data: newBadge, error } = await supabase
          .from('badges')
          .insert({
            user_id: userId,
            badge_type: 'milestone',
            badge_name: `page_${milestone}`,
            badge_tier: 1,
            reward_xp: milestone / 10, // XP reward sesuai milestone
            unlocked_at: new Date().toISOString(),
            description: `Membaca ${milestone} halaman`
          })
          .select()
          .single();

        if (error) throw error;
        if (newBadge) pageBadges.push(newBadge);
      }
    }
  }

  return pageBadges;
}

// Implementasi detail logic badge streak
export async function checkStreakBadges(userId: string, profile: UserProfile): Promise<Badge[]> {
  const streak = profile.streak;
  const milestones = [7, 30, 100]; // Milestone streak (hari)
  const streakBadges: Badge[] = [];

  for (const milestone of milestones) {
    if (streak >= milestone) {
      // Cek apakah badge sudah pernah didapat
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_type', 'streak')
        .eq('badge_name', `streak_${milestone}`)
        .single();

      if (!existingBadge) {
        // Insert badge baru
        const { data: newBadge, error } = await supabase
          .from('badges')
          .insert({
            user_id: userId,
            badge_type: 'streak',
            badge_name: `streak_${milestone}`,
            badge_tier: 1,
            reward_xp: milestone * 20, // XP reward sesuai milestone
            unlocked_at: new Date().toISOString(),
            description: `Membaca ${milestone} hari berturut-turut`
          })
          .select()
          .single();

        if (error) throw error;
        if (newBadge) streakBadges.push(newBadge);
      }
    }
  }

  return streakBadges;
}

// Implementasi detail logic badge gaya membaca
export async function checkReadingStyleBadges(userId: string, sessions: ReadingSession[]): Promise<Badge[]> {
  const readingBadges: Badge[] = [];

  // Cek badge membaca di pagi hari (06:00 - 10:00)
  const morningSessions = sessions.filter(session => {
    const hour = new Date(session.date).getHours();
    return hour >= 6 && hour < 10;
  });
  if (morningSessions.length >= 5) {
    const { data: existingBadge } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_type', 'reading')
      .eq('badge_name', 'morning_reader')
      .single();
    if (!existingBadge) {
      const { data: newBadge, error } = await supabase
        .from('badges')
        .insert({
          user_id: userId,
          badge_type: 'reading',
          badge_name: 'morning_reader',
          badge_tier: 1,
          reward_xp: 200,
          unlocked_at: new Date().toISOString(),
          description: 'Membaca 5 kali di pagi hari (06:00 - 10:00)'
        })
        .select()
        .single();
      if (error) throw error;
      if (newBadge) readingBadges.push(newBadge);
    }
  }

  // Cek badge membaca di malam hari (22:00 - 06:00)
  const nightSessions = sessions.filter(session => {
    const hour = new Date(session.date).getHours();
    return hour >= 22 || hour < 6;
  });
  if (nightSessions.length >= 5) {
    const { data: existingBadge } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_type', 'reading')
      .eq('badge_name', 'night_owl')
      .single();
    if (!existingBadge) {
      const { data: newBadge, error } = await supabase
        .from('badges')
        .insert({
          user_id: userId,
          badge_type: 'reading',
          badge_name: 'night_owl',
          badge_tier: 1,
          reward_xp: 200,
          unlocked_at: new Date().toISOString(),
          description: 'Membaca 5 kali di malam hari (22:00 - 06:00)'
        })
        .select()
        .single();
      if (error) throw error;
      if (newBadge) readingBadges.push(newBadge);
    }
  }

  // Cek badge membaca di akhir pekan
  const weekendSessions = sessions.filter(session => {
    const day = new Date(session.date).getDay();
    return day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu
  });
  if (weekendSessions.length >= 5) {
    const { data: existingBadge } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_type', 'reading')
      .eq('badge_name', 'weekend_reader')
      .single();
    if (!existingBadge) {
      const { data: newBadge, error } = await supabase
        .from('badges')
        .insert({
          user_id: userId,
          badge_type: 'reading',
          badge_name: 'weekend_reader',
          badge_tier: 1,
          reward_xp: 200,
          unlocked_at: new Date().toISOString(),
          description: 'Membaca 5 kali di akhir pekan'
        })
        .select()
        .single();
      if (error) throw error;
      if (newBadge) readingBadges.push(newBadge);
    }
  }

  return readingBadges;
}

// Integrasi awardBadges ke event penting
export async function awardBadgesOnEvent(userId: string, eventType: string, eventData: any): Promise<Badge[]> {
  // 1. Ambil data user (buku, sesi, profile)
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId);

  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', userId);

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 2. Panggil awardBadges dengan data lengkap
  const newBadges = await awardBadges(userId, {
    books: books || [],
    sessions: sessions || [],
    profile,
    eventType,
    eventData
  });

  // 3. Notifikasi badge baru (opsional, bisa di-handle di UI)
  if (newBadges.length > 0) {
    console.log('New badges awarded:', newBadges);
  }

  return newBadges;
}