export interface MasterBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  target: number;
  reward_xp: number;
  description?: string;
}

// Helper untuk membuat badge genre 5 level
function makeGenreBadges(genre: string, baseId: string, names: string[], xps: number[], descs: string[]): MasterBadge[] {
  return [1,2,3,4,5].map(lv => ({
    id: `genre_${baseId}_${lv}`,
    badge_type: 'genre',
    badge_name: `${genre} Lv.${lv}`,
    target: [1,5,15,30,50][lv-1],
    reward_xp: xps[lv-1],
    description: descs[lv-1] || names[lv-1],
  }));
}

export const ALL_BADGES: MasterBadge[] = [
  // === GENRE FIKSI ===
  ...makeGenreBadges('Fantasi', 'fantasi', [
    'Penjelajah Dunia Fantasi','Pendekar Fantasi','Penguasa Alam Magis','Arsitek Dunia Khayalan','Legenda Fantasi Abadi'],
    [25,75,300,750,1500],
    ['Penjelajah Dunia Fantasi','Pendekar Fantasi','Penguasa Alam Magis','Arsitek Dunia Khayalan','Legenda Fantasi Abadi']
  ),
  ...makeGenreBadges('Sci-Fi', 'sci-fi', [
    'Penjelajah Galaksi','Navigator Antariksa','Ahli Teknologi Masa Depan','Arsitek Peradaban Futuristik','Legenda Sains Fiksi'],
    [25,75,300,750,1500],
    ['Penjelajah Galaksi','Navigator Antariksa','Ahli Teknologi Masa Depan','Arsitek Peradaban Futuristik','Legenda Sains Fiksi']
  ),
  ...makeGenreBadges('Romance', 'romance', [
    'Pecinta Awal','Penikmat Cerita Cinta','Perangkai Romansa','Ahli Hati','Legenda Cinta Sejati'],
    [25,75,300,750,1500],
    ['Pecinta Awal','Penikmat Cerita Cinta','Perangkai Romansa','Ahli Hati','Legenda Cinta Sejati']
  ),
  ...makeGenreBadges('Misteri', 'misteri', [
    'Pembaca Misteri Pemula','Pencari Petunjuk','Detektif Imajinatif','Master Intrik','Legenda Misteri Abadi'],
    [25,75,300,750,1500],
    ['Pembaca Misteri Pemula','Pencari Petunjuk','Detektif Imajinatif','Master Intrik','Legenda Misteri Abadi']
  ),
  ...makeGenreBadges('Thriller', 'thriller', [
    'Pemburu Ketegangan','Penggemar Suspense','Ahli Thriller','Master Adrenalin','Legenda Ketegangan'],
    [25,75,300,750,1500],
    ['Pemburu Ketegangan','Penggemar Suspense','Ahli Thriller','Master Adrenalin','Legenda Ketegangan']
  ),
  ...makeGenreBadges('Horror', 'horror', [
    'Pemberani Pemula','Pencari Ketakutan','Penikmat Horor','Master Ketakutan','Legenda Teror'],
    [25,75,300,750,1500],
    ['Pemberani Pemula','Pencari Ketakutan','Penikmat Horor','Master Ketakutan','Legenda Teror']
  ),
  ...makeGenreBadges('Drama', 'drama', [
    'Penikmat Emosi','Pencinta Drama','Ahli Konflik Manusia','Master Dramatik','Legenda Drama Kehidupan'],
    [25,75,300,750,1500],
    ['Penikmat Emosi','Pencinta Drama','Ahli Konflik Manusia','Master Dramatik','Legenda Drama Kehidupan']
  ),
  ...makeGenreBadges('Komedi', 'komedi', [
    'Pencari Tawa','Penikmat Humor','Ahli Komedi','Master Kelucuan','Legenda Penghibur'],
    [25,75,300,750,1500],
    ['Pencari Tawa','Penikmat Humor','Ahli Komedi','Master Kelucuan','Legenda Penghibur']
  ),
  ...makeGenreBadges('Sastra', 'sastra', [
    'Apresiator Sastra','Pencinta Karya Sastra','Penikmat Prosa Indah','Master Sastra','Legenda Kesusastraan'],
    [25,75,300,750,1500],
    ['Apresiator Sastra','Pencinta Karya Sastra','Penikmat Prosa Indah','Master Sastra','Legenda Kesusastraan']
  ),
  ...makeGenreBadges('Young Adult', 'young-adult', [
    'Pembaca Muda','Penikmat YA','Ahli Cerita Remaja','Master Youth Literature','Legenda Sastra Muda'],
    [25,75,300,750,1500],
    ['Pembaca Muda','Penikmat YA','Ahli Cerita Remaja','Master Youth Literature','Legenda Sastra Muda']
  ),
  ...makeGenreBadges('Dystopia', 'dystopia', [
    'Pengamat Masa Depan','Pencinta Dunia Kelam','Ahli Distopia','Master Dunia Alternatif','Legenda Peradaban Kelam'],
    [25,75,300,750,1500],
    ['Pengamat Masa Depan','Pencinta Dunia Kelam','Ahli Distopia','Master Dunia Alternatif','Legenda Peradaban Kelam']
  ),
  ...makeGenreBadges('Historical Fiction', 'historical-fiction', [
    'Penjelajah Sejarah','Pencinta Fiksi Historis','Ahli Narasi Masa Lalu','Master Sejarah Imajinatif','Legenda Fiksi Historis'],
    [25,75,300,750,1500],
    ['Penjelajah Sejarah','Pencinta Fiksi Historis','Ahli Narasi Masa Lalu','Master Sejarah Imajinatif','Legenda Fiksi Historis']
  ),
  ...makeGenreBadges('Adventure', 'adventure', [
    'Pencari Petualangan','Penjelajah Aksi','Ahli Petualangan','Master Adventure','Legenda Petualang'],
    [25,75,300,750,1500],
    ['Pencari Petualangan','Penjelajah Aksi','Ahli Petualangan','Master Adventure','Legenda Petualang']
  ),
  ...makeGenreBadges('Western', 'western', [
    'Koboi Pemula','Penunggang Kuda','Ahli Wild West','Master Frontier','Legenda Koboi'],
    [25,75,300,750,1500],
    ['Koboi Pemula','Penunggang Kuda','Ahli Wild West','Master Frontier','Legenda Koboi']
  ),
  ...makeGenreBadges('Crime', 'crime', [
    'Pengamat Kejahatan','Analis Kriminal','Ahli Crime Story','Master Criminal Mind','Legenda Crime Fighter'],
    [25,75,300,750,1500],
    ['Pengamat Kejahatan','Analis Kriminal','Ahli Crime Story','Master Criminal Mind','Legenda Crime Fighter']
  ),
  ...makeGenreBadges('Supernatural', 'supernatural', [
    'Pencari Gaib','Penikmat Supernatural','Ahli Dunia Gaib','Master Paranormal','Legenda Supernatural'],
    [25,75,300,750,1500],
    ['Pencari Gaib','Penikmat Supernatural','Ahli Dunia Gaib','Master Paranormal','Legenda Supernatural']
  ),
  ...makeGenreBadges('Urban Fantasy', 'urban-fantasy', [
    'Penjelajah Kota Magis','Navigator Urban Magic','Ahli Fantasi Modern','Master Urban Fantasy','Legenda Kota Magis'],
    [25,75,300,750,1500],
    ['Penjelajah Kota Magis','Navigator Urban Magic','Ahli Fantasi Modern','Master Urban Fantasy','Legenda Kota Magis']
  ),
  ...makeGenreBadges('Steampunk', 'steampunk', [
    'Penjelajah Era Uap','Mekanik Victorian','Ahli Steampunk','Master Teknologi Uap','Legenda Era Mesin'],
    [25,75,300,750,1500],
    ['Penjelajah Era Uap','Mekanik Victorian','Ahli Steampunk','Master Teknologi Uap','Legenda Era Mesin']
  ),
  ...makeGenreBadges('Cyberpunk', 'cyberpunk', [
    'Hacker Pemula','Navigator Cyber','Ahli Cyberpunk','Master Digital Dystopia','Legenda Cyber World'],
    [25,75,300,750,1500],
    ['Hacker Pemula','Navigator Cyber','Ahli Cyberpunk','Master Digital Dystopia','Legenda Cyber World']
  ),
  ...makeGenreBadges('Post-Apocalyptic', 'post-apocalyptic', [
    'Survivor Pemula','Penjelajah Reruntuhan','Ahli Post-Apocalypse','Master Wasteland','Legenda Survivor'],
    [25,75,300,750,1500],
    ['Survivor Pemula','Penjelajah Reruntuhan','Ahli Post-Apocalypse','Master Wasteland','Legenda Survivor']
  ),
  ...makeGenreBadges('Space Opera', 'space-opera', [
    'Pilot Antariksa','Kapten Galaksi','Ahli Space Opera','Master Cosmic Story','Legenda Galactic'],
    [25,75,300,750,1500],
    ['Pilot Antariksa','Kapten Galaksi','Ahli Space Opera','Master Cosmic Story','Legenda Galactic']
  ),
  ...makeGenreBadges('Alternate History', 'alternate-history', [
    'Peneliti Timeline','Navigator Alternatif','Ahli Sejarah Alternatif','Master Timeline','Legenda Alternate Reality'],
    [25,75,300,750,1500],
    ['Peneliti Timeline','Navigator Alternatif','Ahli Sejarah Alternatif','Master Timeline','Legenda Alternate Reality']
  ),
  ...makeGenreBadges('Fairy Tale', 'fairy-tale', [
    'Pencinta Dongeng','Penikmat Fairy Tale','Ahli Cerita Peri','Master Fairy Tale','Legenda Dongeng'],
    [25,75,300,750,1500],
    ['Pencinta Dongeng','Penikmat Fairy Tale','Ahli Cerita Peri','Master Fairy Tale','Legenda Dongeng']
  ),
  ...makeGenreBadges('Superhero', 'superhero', [
    'Fan Superhero','Pengagum Pahlawan','Ahli Superhero','Master Hero Story','Legenda Pahlawan'],
    [25,75,300,750,1500],
    ['Fan Superhero','Pengagum Pahlawan','Ahli Superhero','Master Hero Story','Legenda Pahlawan']
  ),
  ...makeGenreBadges('Military Fiction', 'military-fiction', [
    'Rekrut Literasi','Prajurit Buku','Ahli Military Fiction','Master War Story','Legenda Perang'],
    [25,75,300,750,1500],
    ['Rekrut Literasi','Prajurit Buku','Ahli Military Fiction','Master War Story','Legenda Perang']
  ),
  ...makeGenreBadges('Spy/Espionage', 'spy-espionage', [
    'Agen Pemula','Mata-mata Buku','Ahli Espionage','Master Spy Story','Legenda Secret Agent'],
    [25,75,300,750,1500],
    ['Agen Pemula','Mata-mata Buku','Ahli Espionage','Master Spy Story','Legenda Secret Agent']
  ),
  // === GENRE NON-FIKSI ===
  ...makeGenreBadges('Filsafat', 'filsafat', [
    'Perenung Sunyi','Penjelajah Akal','Filsuf Sejati','Arsitek Pemikiran Abadi','Legenda Filsafat'],
    [25,75,300,750,1500],
    ['Perenung Sunyi','Penjelajah Akal','Filsuf Sejati','Arsitek Pemikiran Abadi','Legenda Filsafat']
  ),
  ...makeGenreBadges('Self-Improvement', 'self-improvement', [
    'Pembentuk Diri Pemula','Pengembang Potensi','Arsitek Diri Sejati','Guru Transformasi Hidup','Legenda Perubahan Diri'],
    [25,75,300,750,1500],
    ['Pembentuk Diri Pemula','Pengembang Potensi','Arsitek Diri Sejati','Guru Transformasi Hidup','Legenda Perubahan Diri']
  ),
  ...makeGenreBadges('Sejarah', 'sejarah', [
    'Penjelajah Waktu','Penelusur Masa Lalu','Ahli Kronik','Arkeolog Literasi','Legenda Historis'],
    [25,75,300,750,1500],
    ['Penjelajah Waktu','Penelusur Masa Lalu','Ahli Kronik','Arkeolog Literasi','Legenda Historis']
  ),
  ...makeGenreBadges('Biografi', 'biografi', [
    'Pengagum Tokoh','Penelusur Kehidupan','Penggali Inspirasi','Sejarawan Pribadi','Legenda Kehidupan'],
    [25,75,300,750,1500],
    ['Pengagum Tokoh','Penelusur Kehidupan','Penggali Inspirasi','Sejarawan Pribadi','Legenda Kehidupan']
  ),
  ...makeGenreBadges('Parenting', 'parenting', [
    'Penuntun Awal','Penyayang Anak','Pengasuh Bijak','Ahli Pola Asuh','Legenda Keluarga'],
    [25,75,300,750,1500],
    ['Penuntun Awal','Penyayang Anak','Pengasuh Bijak','Ahli Pola Asuh','Legenda Keluarga']
  ),
  ...makeGenreBadges('Psikologi', 'psikologi', [
    'Pengamat Jiwa','Peneliti Perilaku','Ahli Psikologi','Master Pikiran Manusia','Legenda Psikologi'],
    [25,75,300,750,1500],
    ['Pengamat Jiwa','Peneliti Perilaku','Ahli Psikologi','Master Pikiran Manusia','Legenda Psikologi']
  ),
  ...makeGenreBadges('Bisnis', 'bisnis', [
    'Pebisnis Pemula','Pengusaha Muda','Ahli Strategi Bisnis','Master Entrepreneurship','Legenda Bisnis'],
    [25,75,300,750,1500],
    ['Pebisnis Pemula','Pengusaha Muda','Ahli Strategi Bisnis','Master Entrepreneurship','Legenda Bisnis']
  ),
  ...makeGenreBadges('Kesehatan', 'kesehatan', [
    'Pencari Hidup Sehat','Penikmat Wellness','Ahli Kesehatan','Master Hidup Sehat','Legenda Kesehatan'],
    [25,75,300,750,1500],
    ['Pencari Hidup Sehat','Penikmat Wellness','Ahli Kesehatan','Master Hidup Sehat','Legenda Kesehatan']
  ),
  ...makeGenreBadges('Sains', 'sains', [
    'Penasaran Sains','Peneliti Alam','Ahli Pengetahuan','Master Sains','Legenda Ilmu Pengetahuan'],
    [25,75,300,750,1500],
    ['Penasaran Sains','Peneliti Alam','Ahli Pengetahuan','Master Sains','Legenda Ilmu Pengetahuan']
  ),
  ...makeGenreBadges('Teknologi', 'teknologi', [
    'Penjelajah Digital','Penikmat Teknologi','Ahli Tech','Master Teknologi','Legenda Era Digital'],
    [25,75,300,750,1500],
    ['Penjelajah Digital','Penikmat Teknologi','Ahli Tech','Master Teknologi','Legenda Era Digital']
  ),
  ...makeGenreBadges('Keuangan', 'keuangan', [
    'Pengelola Uang Pemula','Perencana Keuangan','Ahli Finansial','Master Investasi','Legenda Keuangan'],
    [25,75,300,750,1500],
    ['Pengelola Uang Pemula','Perencana Keuangan','Ahli Finansial','Master Investasi','Legenda Keuangan']
  ),
  ...makeGenreBadges('Spiritualitas', 'spiritualitas', [
    'Pencari Makna','Penjelajah Spiritual','Ahli Kebatinan','Master Spiritualitas','Legenda Pencerahan'],
    [25,75,300,750,1500],
    ['Pencari Makna','Penjelajah Spiritual','Ahli Kebatinan','Master Spiritualitas','Legenda Pencerahan']
  ),
  ...makeGenreBadges('Travel', 'travel', [
    'Penjelajah Dunia','Pelancong Buku','Ahli Petualangan','Master Traveling','Legenda Penjelajah'],
    [25,75,300,750,1500],
    ['Penjelajah Dunia','Pelancong Buku','Ahli Petualangan','Master Traveling','Legenda Penjelajah']
  ),
  ...makeGenreBadges('Kuliner', 'kuliner', [
    'Pencinta Makanan','Penikmat Kuliner','Ahli Rasa','Master Kuliner','Legenda Gastronomi'],
    [25,75,300,750,1500],
    ['Pencinta Makanan','Penikmat Kuliner','Ahli Rasa','Master Kuliner','Legenda Gastronomi']
  ),
  ...makeGenreBadges('Politik', 'politik', [
    'Pengamat Politik','Analis Kebijakan','Ahli Politik','Master Political Science','Legenda Politik'],
    [25,75,300,750,1500],
    ['Pengamat Politik','Analis Kebijakan','Ahli Politik','Master Political Science','Legenda Politik']
  ),
  ...makeGenreBadges('Ekonomi', 'ekonomi', [
    'Peneliti Ekonomi','Analis Pasar','Ahli Ekonomi','Master Economics','Legenda Ekonomi'],
    [25,75,300,750,1500],
    ['Peneliti Ekonomi','Analis Pasar','Ahli Ekonomi','Master Economics','Legenda Ekonomi']
  ),
  ...makeGenreBadges('Sosiologi', 'sosiologi', [
    'Pengamat Masyarakat','Peneliti Sosial','Ahli Sosiologi','Master Social Science','Legenda Sosiologi'],
    [25,75,300,750,1500],
    ['Pengamat Masyarakat','Peneliti Sosial','Ahli Sosiologi','Master Social Science','Legenda Sosiologi']
  ),
  ...makeGenreBadges('Antropologi', 'antropologi', [
    'Peneliti Budaya','Etnograf Pemula','Ahli Antropologi','Master Cultural Studies','Legenda Antropologi'],
    [25,75,300,750,1500],
    ['Peneliti Budaya','Etnograf Pemula','Ahli Antropologi','Master Cultural Studies','Legenda Antropologi']
  ),
  ...makeGenreBadges('Lingkungan', 'lingkungan', [
    'Pecinta Alam','Aktivis Hijau','Ahli Lingkungan','Master Environmental','Legenda Green Warrior'],
    [25,75,300,750,1500],
    ['Pecinta Alam','Aktivis Hijau','Ahli Lingkungan','Master Environmental','Legenda Green Warrior']
  ),
  ...makeGenreBadges('Seni', 'seni', [
    'Apresiator Seni','Penikmat Karya Seni','Ahli Seni','Master Arts','Legenda Seniman'],
    [25,75,300,750,1500],
    ['Apresiator Seni','Penikmat Karya Seni','Ahli Seni','Master Arts','Legenda Seniman']
  ),
  // === GENRE KHUSUS ===
  ...makeGenreBadges('Puisi', 'puisi', [
    'Pemungut Kata','Penikmat Larik','Penyair Dalam Hati','Perajut Simfoni Kata','Legenda Puisi'],
    [25,75,300,750,1500],
    ['Pemungut Kata','Penikmat Larik','Penyair Dalam Hati','Perajut Simfoni Kata','Legenda Puisi']
  ),
  ...makeGenreBadges('Esai', 'esai', [
    'Pemula Logika','Penelaah Fakta','Penulis Gagasan','Arsitek Pemikiran','Legenda Narasi Realita'],
    [25,75,300,750,1500],
    ['Pemula Logika','Penelaah Fakta','Penulis Gagasan','Arsitek Pemikiran','Legenda Narasi Realita']
  ),
  ...makeGenreBadges('Manga/Komik', 'manga-komik', [
    'Pembaca Visual','Penikmat Komik','Ahli Cerita Bergambar','Master Manga','Legenda Visual Storytelling'],
    [25,75,300,750,1500],
    ['Pembaca Visual','Penikmat Komik','Ahli Cerita Bergambar','Master Manga','Legenda Visual Storytelling']
  ),
  ...makeGenreBadges('Anak-anak', 'anak-anak', [
    'Pembaca Cilik','Penikmat Cerita Anak','Ahli Literasi Anak','Master Children\'s Book','Legenda Sastra Anak'],
    [25,75,300,750,1500],
    ['Pembaca Cilik','Penikmat Cerita Anak','Ahli Literasi Anak','Master Children\'s Book','Legenda Sastra Anak']
  ),
  ...makeGenreBadges('Religi', 'religi', [
    'Pencari Hidayah','Penikmat Kitab','Ahli Teks Suci','Master Spiritual Text','Legenda Keagamaan'],
    [25,75,300,750,1500],
    ['Pencari Hidayah','Penikmat Kitab','Ahli Teks Suci','Master Spiritual Text','Legenda Keagamaan']
  ),
  ...makeGenreBadges('Akademik', 'akademik', [
    'Mahasiswa Literasi','Peneliti Pemula','Ahli Akademik','Master Riset','Legenda Scholastic'],
    [25,75,300,750,1500],
    ['Mahasiswa Literasi','Peneliti Pemula','Ahli Akademik','Master Riset','Legenda Scholastic']
  ),
  ...makeGenreBadges('Ensiklopedia', 'ensiklopedia', [
    'Kolektor Pengetahuan','Pencinta Referensi','Ahli Ensiklopedia','Master Pengetahuan Umum','Legenda Ensiklopedis'],
    [25,75,300,750,1500],
    ['Kolektor Pengetahuan','Pencinta Referensi','Ahli Ensiklopedia','Master Pengetahuan Umum','Legenda Ensiklopedis']
  ),
  ...makeGenreBadges('Memoir', 'memoir', [
    'Pencinta Kisah Nyata','Penikmat Memoir','Ahli Life Story','Master Personal Narrative','Legenda Memoir'],
    [25,75,300,750,1500],
    ['Pencinta Kisah Nyata','Penikmat Memoir','Ahli Life Story','Master Personal Narrative','Legenda Memoir']
  ),
  ...makeGenreBadges('True Crime', 'true-crime', [
    'Pengamat Kasus','Analis Kejahatan Nyata','Ahli True Crime','Master Criminal Case','Legenda True Crime'],
    [25,75,300,750,1500],
    ['Pengamat Kasus','Analis Kejahatan Nyata','Ahli True Crime','Master Criminal Case','Legenda True Crime']
  ),
  ...makeGenreBadges('Antologi', 'antologi', [
    'Kolektor Cerita','Penikmat Antologi','Ahli Kumpulan Cerita','Master Collection','Legenda Antologi'],
    [25,75,300,750,1500],
    ['Kolektor Cerita','Penikmat Antologi','Ahli Kumpulan Cerita','Master Collection','Legenda Antologi']
  ),
  ...makeGenreBadges('Graphic Novel', 'graphic-novel', [
    'Pembaca Grafis','Penikmat Graphic Novel','Ahli Visual Literature','Master Graphic Story','Legenda Graphic Novel'],
    [25,75,300,750,1500],
    ['Pembaca Grafis','Penikmat Graphic Novel','Ahli Visual Literature','Master Graphic Story','Legenda Graphic Novel']
  ),
  ...makeGenreBadges('Light Novel', 'light-novel', [
    'Fan Light Novel','Penikmat LN','Ahli Light Novel','Master LN Culture','Legenda Light Novel'],
    [25,75,300,750,1500],
    ['Fan Light Novel','Penikmat LN','Ahli Light Novel','Master LN Culture','Legenda Light Novel']
  ),
  // ...

  // Milestone badges
  { id: 'milestone_books_3', badge_type: 'milestone', badge_name: 'Pembaca Pemula', target: 3, reward_xp: 50, description: 'Baca 3 buku' },
  { id: 'milestone_books_10', badge_type: 'milestone', badge_name: 'Pembaca Serius', target: 10, reward_xp: 200, description: 'Baca 10 buku' },
  { id: 'milestone_books_25', badge_type: 'milestone', badge_name: 'Kolektor Buku', target: 25, reward_xp: 600, description: 'Baca 25 buku' },
  // ... dst milestone lain

  // Streak badges
  { id: 'streak_3', badge_type: 'streak', badge_name: 'Langkah Awal', target: 3, reward_xp: 20, description: '3 hari berturut-turut' },
  { id: 'streak_7', badge_type: 'streak', badge_name: 'Pahlawan Mingguan', target: 7, reward_xp: 60, description: '7 hari berturut-turut' },
  { id: 'streak_30', badge_type: 'streak', badge_name: 'Bintang Disiplin', target: 30, reward_xp: 400, description: '30 hari berturut-turut' },
  // ... dst streak lain
];