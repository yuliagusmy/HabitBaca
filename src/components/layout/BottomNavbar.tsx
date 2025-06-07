import {
    Award,
    BarChart2,
    BookOpen,
    LayoutDashboard,
    LogOut,
    User
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNavbar = () => {
  const { signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary-600 flex justify-between md:hidden rounded-t-3xl">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 transition-all duration-200 ${isActive ? '' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <span className={
              showLogoutConfirm
                ? 'mb-1 text-white'
                : isActive
                ? 'bg-white text-primary-600 rounded-full p-2 mb-0 shadow-lg scale-125 -translate-y-6 border-4 border-primary-600 transition-all duration-200'
                : 'mb-1 text-white transition-all duration-200'
            }>
              <LayoutDashboard className={isActive ? 'h-7 w-7' : 'h-6 w-6'} />
            </span>
            {!isActive && <span className="text-xs text-white">Dashboard</span>}
          </>
        )}
      </NavLink>
      <NavLink
        to="/books"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 transition-all duration-200 ${isActive ? '' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <span className={
              showLogoutConfirm
                ? 'mb-1 text-white'
                : isActive
                ? 'bg-white text-primary-600 rounded-full p-2 mb-0 shadow-lg scale-125 -translate-y-6 border-4 border-primary-600 transition-all duration-200'
                : 'mb-1 text-white transition-all duration-200'
            }>
              <BookOpen className={isActive ? 'h-7 w-7' : 'h-6 w-6'} />
            </span>
            {!isActive && <span className="text-xs text-white">Books</span>}
          </>
        )}
      </NavLink>
      <NavLink
        to="/stats"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 transition-all duration-200 ${isActive ? '' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <span className={
              showLogoutConfirm
                ? 'mb-1 text-white'
                : isActive
                ? 'bg-white text-primary-600 rounded-full p-2 mb-0 shadow-lg scale-125 -translate-y-6 border-4 border-primary-600 transition-all duration-200'
                : 'mb-1 text-white transition-all duration-200'
            }>
              <BarChart2 className={isActive ? 'h-7 w-7' : 'h-6 w-6'} />
            </span>
            {!isActive && <span className="text-xs text-white">Stats</span>}
          </>
        )}
      </NavLink>
      <NavLink
        to="/achievements"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 transition-all duration-200 ${isActive ? '' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <span className={
              showLogoutConfirm
                ? 'mb-1 text-white'
                : isActive
                ? 'bg-white text-primary-600 rounded-full p-2 mb-0 shadow-lg scale-125 -translate-y-6 border-4 border-primary-600 transition-all duration-200'
                : 'mb-1 text-white transition-all duration-200'
            }>
              <Award className={isActive ? 'h-7 w-7' : 'h-6 w-6'} />
            </span>
            {!isActive && <span className="text-xs text-white">Achievements</span>}
          </>
        )}
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center flex-1 py-2 transition-all duration-200 ${isActive ? '' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <span className={
              showLogoutConfirm
                ? 'mb-1 text-white'
                : isActive
                ? 'bg-white text-primary-600 rounded-full p-2 mb-0 shadow-lg scale-125 -translate-y-6 border-4 border-primary-600 transition-all duration-200'
                : 'mb-1 text-white transition-all duration-200'
            }>
              <User className={isActive ? 'h-7 w-7' : 'h-6 w-6'} />
            </span>
            {!isActive && <span className="text-xs text-white">Profile</span>}
          </>
        )}
      </NavLink>
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="flex flex-col items-center flex-1 py-2 transition-all duration-200"
      >
        <span className={
          showLogoutConfirm
            ? 'bg-red-500 text-white rounded-full p-2 mb-0 shadow-lg scale-125 -translate-y-6 border-4 border-red-500 transition-all duration-200'
            : 'mb-1 text-white transition-all duration-200'
        }>
          <LogOut className={showLogoutConfirm ? 'h-7 w-7 text-white' : 'h-6 w-6'} />
        </span>
        {!showLogoutConfirm && <span className="text-xs text-white">Logout</span>}
      </button>

      {/* Modal konfirmasi logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 max-w-full flex flex-col items-center">
            <div className="text-lg font-bold text-gray-800 mb-4 text-center">Apakah Anda yakin ingin keluar?</div>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => { setShowLogoutConfirm(false); signOut(); }}
                className="px-5 py-2 rounded-lg bg-primary-600 text-white font-bold shadow hover:bg-primary-700 transition"
              >
                Ya
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default BottomNavbar;