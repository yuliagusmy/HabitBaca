import {
    BarChart2,
    BookOpen,
    LayoutDashboard,
    LogOut,
    User
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNavbar = () => {
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between md:hidden">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
        }
      >
        <LayoutDashboard className="h-6 w-6 mb-1" />
        <span className="text-xs">Dashboard</span>
      </NavLink>
      <NavLink
        to="/books"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
        }
      >
        <BookOpen className="h-6 w-6 mb-1" />
        <span className="text-xs">Books</span>
      </NavLink>
      <NavLink
        to="/stats"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
        }
      >
        <BarChart2 className="h-6 w-6 mb-1" />
        <span className="text-xs">Stats</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
        }
      >
        <User className="h-6 w-6 mb-1" />
        <span className="text-xs">Profile</span>
      </NavLink>
      <button
        onClick={signOut}
        className="flex flex-col items-center flex-1 py-2 text-gray-500 hover:text-red-600"
      >
        <LogOut className="h-6 w-6 mb-1" />
        <span className="text-xs">Logout</span>
      </button>
    </nav>
  );
};

export default BottomNavbar;