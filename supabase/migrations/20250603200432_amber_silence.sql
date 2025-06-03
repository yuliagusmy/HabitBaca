/*
  # Initial Schema for HabitBaca Reading App

  1. Tables
    - `books`: Stores user's book collection with tracking data
    - `reading_sessions`: Records daily reading activities
    - `user_profiles`: Stores user profiles with gamification data
    - `badges`: Tracks user achievements
    - `book_notes`: Stores notes and ratings for completed books

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies set for authenticated users to access their own data
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  total_pages integer NOT NULL,
  current_page integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('wishlist', 'reading', 'completed')),
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create reading sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  pages_read integer NOT NULL,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  last_reading_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_tier integer NOT NULL DEFAULT 1,
  badge_name text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now()
);

-- Create book notes table
CREATE TABLE IF NOT EXISTS book_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  notes text NOT NULL,
  rating integer NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for books
CREATE POLICY "Users can view their own books"
  ON books
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON books
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON books
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for reading sessions
CREATE POLICY "Users can view their own reading sessions"
  ON reading_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading sessions"
  ON reading_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading sessions"
  ON reading_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading sessions"
  ON reading_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for badges
CREATE POLICY "Users can view their own badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for book notes
CREATE POLICY "Users can view their own book notes"
  ON book_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own book notes"
  ON book_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book notes"
  ON book_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book notes"
  ON book_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS books_user_id_idx ON books(user_id);
CREATE INDEX IF NOT EXISTS books_status_idx ON books(status);
CREATE INDEX IF NOT EXISTS reading_sessions_user_id_idx ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS reading_sessions_book_id_idx ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS reading_sessions_date_idx ON reading_sessions(date);
CREATE INDEX IF NOT EXISTS badges_user_id_idx ON badges(user_id);
CREATE INDEX IF NOT EXISTS book_notes_user_id_idx ON book_notes(user_id);
CREATE INDEX IF NOT EXISTS book_notes_book_id_idx ON book_notes(book_id);