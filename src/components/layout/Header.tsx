import { BookOpen, PlusSquare } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddReadingModal from '../features/books/AddReadingModal';

const Header = () => {
  const { signOut } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();

  // Page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/books') return 'My Books';
    if (path.startsWith('/books/')) return 'Book Details';
    if (path === '/stats') return 'Statistics';
    if (path === '/profile') return 'Profile';
    return 'HabitBaca';
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + HabitBaca di kiri, hanya mobile */}
          <div className="flex items-center gap-3 sm:hidden mr-2">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <span className="font-extrabold text-primary-600 text-2xl">HabitBaca</span>
            </div>
          <div className="flex rounded-lg overflow-hidden">
            {/* Page title dihapus sesuai permintaan user */}
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* Add reading session button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-2 py-1 text-sm sm:px-4 sm:py-2 sm:text-base rounded-lg bg-primary-600 text-white font-bold shadow hover:bg-primary-700 transition"
            >
              <PlusSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add Reading</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Reading Modal */}
      <AddReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </header>
  );
};

export default Header;