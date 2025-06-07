import { Award, BookOpen, Home, Settings } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const BottomBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16">
      <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-primary-600">
        <Home className="w-6 h-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/books" className="flex flex-col items-center text-gray-600 hover:text-primary-600">
        <BookOpen className="w-6 h-6" />
        <span className="text-xs mt-1">Books</span>
      </Link>
      <Link to="/achievements" className="flex flex-col items-center text-gray-600 hover:text-primary-600">
        <Award className="w-6 h-6" />
        <span className="text-xs mt-1">Achievements</span>
      </Link>
      <Link to="/settings" className="flex flex-col items-center text-gray-600 hover:text-primary-600">
        <Settings className="w-6 h-6" />
        <span className="text-xs mt-1">Settings</span>
      </Link>
    </div>
  );
};

export default BottomBar;