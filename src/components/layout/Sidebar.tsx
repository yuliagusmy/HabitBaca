import {
    Award,
    BarChart2,
    BookOpen,
    LayoutDashboard,
    LogOut,
    User
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserLevel from '../features/UserLevel';

const Sidebar = () => {
  const { signOut, profile } = useAuth();

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* App logo & title */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-primary-600 font-bold text-xl"
        >
          <BookOpen className="w-8 h-8" />
          <span>HabitBaca</span>
        </NavLink>
      </div>

      {/* User level summary */}
      <div className="p-4 border-b border-gray-200">
        <UserLevel profile={profile} />
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>

        <NavLink
          to="/books"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <BookOpen className="mr-3 h-5 w-5" />
          My Books
        </NavLink>

        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <BarChart2 className="mr-3 h-5 w-5" />
          Statistics
        </NavLink>

        <NavLink
          to="/achievements"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Award className="mr-3 h-5 w-5" />
          Achievements
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <User className="mr-3 h-5 w-5" />
          Profile
        </NavLink>
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={signOut}
          className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;