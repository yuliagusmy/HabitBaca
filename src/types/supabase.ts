export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string;
          genre: string;
          total_pages: number;
          current_page: number;
          status: 'wishlist' | 'reading' | 'completed';
          created_at: string;
          updated_at: string;
          cover_url?: string;
        };
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['books']['Row'], 'id' | 'user_id'>>;
      };
      reading_sessions: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          pages_read: number;
          date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reading_sessions']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['reading_sessions']['Row'], 'id' | 'user_id'>>;
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          level: number;
          xp: number;
          streak: number;
          last_reading_date: string | null;
          total_pages_read: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at' | 'level' | 'xp' | 'streak'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'user_id'>>;
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          badge_tier: number;
          badge_name: string;
          unlocked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id' | 'unlocked_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['badges']['Row'], 'id' | 'user_id' | 'unlocked_at'>>;
      };
      book_notes: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          notes: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['book_notes']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['book_notes']['Row'], 'id' | 'user_id'>>;
      };
    };
  };
}

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  streak: number;
  last_reading_date: string | null;
  total_pages_read: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  total_pages: number;
  current_page: number;
  status: 'wishlist' | 'reading' | 'completed';
  cover_url?: string;
  progress?: number; // Calculated field
  created_at: string;
  updated_at: string;
}

export interface ReadingSession {
  id: string;
  book_id: string;
  pages_read: number;
  date: string;
  book?: Book; // Optional joined field
}

export interface Badge {
  id: string;
  badge_type: string;
  badge_tier: number;
  badge_name: string;
  unlocked_at: string;
}

export interface BookNote {
  id: string;
  book_id: string;
  notes: string;
  rating: number;
  book?: Book; // Optional joined field
}