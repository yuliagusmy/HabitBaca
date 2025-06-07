import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Badge, Book } from '../../../types/supabase';
import { awardBadgesOnEvent } from '../../../utils/awardBadges';
import BadgeNotification from '../achievements/BadgeNotification';

interface AddReadingSessionModalProps {
  book: Book;
  onSuccess: () => void;
}

const AddReadingSessionModal: React.FC<AddReadingSessionModalProps> = ({ book, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pagesRead, setPagesRead] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Insert sesi baru
      const { data: session, error } = await supabase
        .from('reading_sessions')
        .insert({
          user_id: user.id,
          book_id: book.id,
          pages_read: pagesRead,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Cek & award badge baru
      const badges = await awardBadgesOnEvent(user.id, 'session_added', { book, pagesRead });
      if (badges.length > 0) {
        setNewBadges(badges);
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={pagesRead}
          onChange={(e) => setPagesRead(Number(e.target.value))}
          min="1"
          max={book.total_pages - book.current_page}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Session'}
        </button>
      </form>
      <BadgeNotification badges={newBadges} />
    </>
  );
};

export default AddReadingSessionModal;