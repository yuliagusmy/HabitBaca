import { supabase } from '../lib/supabase';

/**
 * Hitung XP user berdasarkan seluruh reading_sessions dan buku completed.
 * XP = total halaman dari semua session + bonus selesai buku (berdasarkan total_pages)
 * Bonus: <150 halaman = 50 XP, 150-300 = 100 XP, >300 = 150 XP
 */
export async function syncUserXP(userId: string) {
  // 1. Ambil semua reading_sessions user
  const { data: sessions, error: sessionsError } = await supabase
    .from('reading_sessions')
    .select('pages_read')
    .eq('user_id', userId);
  if (sessionsError) throw sessionsError;

  // 2. Ambil semua buku completed user
  const { data: completedBooks, error: booksError } = await supabase
    .from('books')
    .select('total_pages')
    .eq('user_id', userId)
    .eq('status', 'completed');
  if (booksError) throw booksError;

  // 3. Hitung XP dasar
  const baseXP = sessions?.reduce((sum, s) => sum + (s.pages_read || 0), 0) || 0;

  // 4. Hitung bonus XP buku selesai
  let bonusXP = 0;
  for (const book of completedBooks || []) {
    if (book.total_pages < 150) bonusXP += 50;
    else if (book.total_pages <= 300) bonusXP += 100;
    else bonusXP += 150;
  }

  // 5. Total XP
  const totalXP = baseXP + bonusXP;

  // 6. Update ke user_profiles
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ xp: totalXP })
    .eq('user_id', userId);
  if (updateError) throw updateError;

  return totalXP;
}

/**
 * Ambil dan gabungkan aktivitas user dari books & reading_sessions.
 * Return: array aktivitas, urut terbaru ke terlama.
 */
export async function fetchUserActivities(userId: string, limit: number = 100) {
  // 1. Ambil semua sesi membaca (join judul buku)
  const { data: sessions, error: sessionsError } = await supabase
    .from('reading_sessions')
    .select(`
      id,
      book_id,
      pages_read,
      date,
      created_at,
      books (
        id,
        title,
        author
      )
    `)
    .eq('user_id', userId);
  if (sessionsError) throw sessionsError;

  // 2. Ambil semua buku
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, author, status, created_at, updated_at, total_pages')
    .eq('user_id', userId);
  if (booksError) throw booksError;

  // 3. Gabungkan aktivitas
  let activities = [];

  // Tambah aktivitas: tambah buku
  for (const book of books || []) {
    activities.push({
      type: 'add_book',
      bookId: book.id,
      title: book.title,
      author: book.author,
      time: book.created_at,
      status: book.status,
    });
    // Jika status completed dan updated_at berbeda dengan created_at, anggap sebagai selesai buku
    if (book.status === 'completed' && book.updated_at !== book.created_at) {
      activities.push({
        type: 'complete_book',
        bookId: book.id,
        title: book.title,
        author: book.author,
        time: book.updated_at,
        status: book.status,
        totalPages: book.total_pages,
      });
    }
  }

  // Tambah aktivitas: sesi membaca
  for (const session of sessions || []) {
    let book: any = session.books;
    if (Array.isArray(book)) book = book[0];
    activities.push({
      type: 'reading_session',
      sessionId: session.id,
      bookId: session.book_id,
      pagesRead: session.pages_read,
      time: session.created_at || session.date,
      bookTitle: book?.title || 'Unknown Book',
      bookAuthor: book?.author || 'Unknown Author',
    });
  }

  // Urutkan berdasarkan waktu terbaru
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Batasi jumlah jika perlu
  return activities.slice(0, limit);
}