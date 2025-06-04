import { PlusSquare } from 'lucide-react';
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
          <div className="flex">
            {/* Page title */}
            <div className="flex items-center ml-4 md:ml-0">
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* Add reading session button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="ml-3 btn-primary flex items-center"
            >
              <PlusSquare className="mr-2 h-5 w-5" />
              <span className="hidden sm:block">Add Reading</span>
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