import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';
import BottomNavbar from './BottomNavbar';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex md:w-59 md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Layout;